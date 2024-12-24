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


exports.addMagnetLink = async (req, res) => {  
    const { magnetLink } = req.body;  

    try {  
        if (!magnetLink?.startsWith('magnet:?xt=urn:btih:')) {  
            return res.status(400).json({ error: 'Invalid magnet link' });  
        }  

        // Start the download and get torrent info including size  
        const torrent = await DownloadManager.startDownload(magnetLink, req.user.id);  
        
        // Assuming `torrent` has a size attribute and we can format it if needed  
        const formattedSize = formatFileSize(torrent.size); // Format the size if needed  

        // Save the torrent to the database  
        const newTorrent = new Torrent({  
            user: req.user.id,  
            magnetLink: magnetLink,  
            size: torrent.size,  
            formattedSize: formattedSize,  
            // Set other fields as needed  
        });  

        await newTorrent.save();  

        return res.status(201).json({   
            success: true,   
            message: 'Download started',  
            torrent: newTorrent // Return the saved torrent  
        });  
    } catch (error) {  
        console.error('Magnet link error:', error);  
        return res.status(500).json({ error: error.message });  
    }  
};

// Upload File

exports.uploadTorrentFile = async (req, res) => {  
    if (!req.file) {  
        return res.status(400).json({   
            error: true,  
            message: 'No torrent file uploaded'   
        });  
    }  

    try {  
        // Verify file exists before reading  
        if (!fs.existsSync(req.file.path)) {  
            throw new Error('Upload file not found');  
        }  

        const fileBuffer = fs.readFileSync(req.file.path);  
        
        // Verify valid torrent file  
        let torrentData;  
        try {  
            torrentData = parseTorrentFile(fileBuffer);  
        } catch (error) {  
            throw new Error('Invalid torrent file format');  
        }  

        const magnetLink = `magnet:?xt=urn:btih:${torrentData.infoHash}`;  

        // Extract size and compute formattedSize  
        const size = torrentData.length; // Get the size from parsed torrent data  
        const formattedSize = formatFileSize(size); // Use the format function to get a human readable size  
    
        // Start download with updated size  
        const torrent = await DownloadManager.startDownload(magnetLink, req.user.id, size, formattedSize);  
        
        // Upload to B2  
        try {  
            const uploadResponse = await uploadFileToB2(req.file.path, req.file.originalname);  
            await Torrent.findByIdAndUpdate(torrent._id, {  
                filePath: uploadResponse.fileName  
            });  
        } catch (uploadError) {  
            console.error('B2 upload error:', uploadError);  
            // Continue even if B2 upload fails  
        }  

        return res.status(201).json({  
            success: true,  
            message: 'Torrent upload successful',  
            torrent  
        });  
    } catch (error) {  
        console.error('Torrent upload error:', error);  
        return res.status(500).json({   
            error: true,  
            message: error.message || 'Failed to process torrent file'   
        });  
    } finally {  
        // Cleanup  
        if (req.file?.path) {  
            fs.unlink(req.file.path, err => {  
                if (err) console.error('Cleanup error:', err);  
            });  
        }  
    }  
};
