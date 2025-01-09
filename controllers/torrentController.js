// controllers/torrentController.js

const fs = require('fs');
const axios = require('axios');
const parseTorrentFile = require('parse-torrent-file');
const Torrent = require('../models/Torrent');
const DownloadManager = require('../services/downloadManager');
const { uploadFileToB2 } = require('../utils/backblaze');
const upload = require('../middleware/uploadTorrent');
const { formatFileSize } = require('../utils/formatters');

// Search Torrents via External API  
exports.searchTorrents = async (req, res) => {  
  const { query, page = 1, limit = 10 } = req.query; // Added limit for pagination

  // Parse page and limit to integers
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (!query) {  
    return res.status(400).json({ message: 'Search query is required.' });  
  }  

  try {  
    const response = await axios.get(process.env.EXTERNAL_TORRENT_API_URL, {  
      params: { q: query, page: parsedPage, limit: parsedLimit }, // Adjusting params based on expected API  
    });  

    // Log the entire response to debug
    console.log('External API Response:', response.data);

    // Check if the response is an array and has results
    if (Array.isArray(response.data) && response.data.length > 0) {  
      const totalResults = response.data.length; // Total number of results
      const totalPages = Math.ceil(totalResults / parsedLimit); // Calculate total pages based on limit

      // Map through results to add magnet link
      const resultsWithMagnetLink = response.data.map(item => ({
        ...item,
        magnetLink: `magnet:?xt=urn:btih:${item.info_hash}` // Construct the magnet link
      }));

      res.json({  
        currentPage: parsedPage,  
        totalPages: totalPages,  
        totalResults: totalResults,  
        results: resultsWithMagnetLink, // The actual list of results with magnet links  
      });  
    } else {  
      res.status(404).json({ message: 'No results found.' });  
    }  
  } catch (error) {  
    console.error('Error fetching torrents from the external search engine:', error.message);  
    res.status(500).json({ error: 'Error fetching torrents from the external search engine.' });  
  }  
};


// Upload Torrent File Handler
exports.uploadTorrentFile = async (req, res) => {  
    if (!req.file) {  
        return res.status(400).json({   
            success: false,  
            message: 'Please select a file to upload'   
        });  
    }  

    try {  
        // Use buffer directly from memory storage
        const fileBuffer = req.file.buffer;
        
        // Verify valid torrent file  
        let torrentData;  
        try {  
            torrentData = parseTorrentFile(fileBuffer);  
        } catch (error) {  
            throw new Error('Invalid torrent file format');  
        }  

        const magnetLink = `magnet:?xt=urn:btih:${torrentData.infoHash}`;  
        const size = torrentData.length;
        const formattedSize = formatFileSize(size);

        // Upload to B2 using buffer
        const uploadResponse = await uploadFileToB2(fileBuffer, req.file.originalname);
        
        if (!uploadResponse || !uploadResponse.fileName) {
            throw new Error('Failed to upload file to Backblaze');
        }

        // Create initial torrent record
        const torrent = new Torrent({
            user: req.user.id,
            magnetLink,
            size,
            formattedSize,
            filePath: uploadResponse.fileName,
            status: 'queued'
        });
        await torrent.save();

        // Send response immediately
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                torrentId: torrent._id,
                fileName: uploadResponse.fileName,
                size: formattedSize
            }
        });

        // Start download process after sending response
        DownloadManager.startDownload(magnetLink, req.user.id)
            .catch(error => console.error('Download error:', error));

    } catch (error) {
        console.error('Torrent upload error:', error);
        return res.status(500).json({   
            success: false,  
            message: error.message || 'Failed to process torrent file'   
        });  
    }
};

exports.addMagnetLink = async (req, res) => {  
    const { magnetLink } = req.body;  

    try {  
        if (!magnetLink?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'Please enter a magnet link' 
            });  
        }

        if (!magnetLink?.startsWith('magnet:?xt=urn:btih:')) {  
            return res.status(400).json({ 
                success: false,
                message: 'Invalid magnet link format' 
            });  
        }  

        // Create initial torrent record with default size values
        const torrent = new Torrent({
            user: req.user.id,
            magnetLink,
            size: 0,
            formattedSize: '0 B',
            status: 'queued'
        });
        await torrent.save();

        // Send response immediately
        res.status(201).json({   
            success: true,   
            message: 'Magnet link added successfully',
            data: {
                torrentId: torrent._id,
                magnetLink
            }
        });  

        // Start download process after sending response
        DownloadManager.startDownload(magnetLink, req.user.id)
            .then(async (downloadInfo) => {
                if (downloadInfo?.size) {
                    // Get the downloaded file buffer
                    const fileBuffer = await downloadInfo.getFileBuffer();
                    
                    // Upload to B2
                    const uploadResponse = await uploadFileToB2(
                        fileBuffer,
                        `${torrent._id}_${downloadInfo.fileName || 'download'}`
                    );

                    // Update torrent with size and B2 file path
                    await Torrent.findByIdAndUpdate(torrent._id, {
                        size: downloadInfo.size,
                        formattedSize: formatFileSize(downloadInfo.size),
                        filePath: uploadResponse.fileName
                    });

                    // Clean up local downloaded file
                    await downloadInfo.cleanup();
                }
            })
            .catch(error => console.error('Download error:', error));

    } catch (error) {  
        console.error('Magnet link error:', error);  
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to process magnet link'
        });  
    }  
};