// const Torrent = require('../../../models/Torrent'); 
import Torrent from '../../../models/Torrent.js';

export const createTorrent = async ({ userId, magnetLink, fileName, size, seeders, leechers }) => {  
  const torrent = new Torrent({  
    user: userId || null,  // can remain null if not provided  
    magnetLink,  
    fileName: fileName || 'unknown',  // default to 'unknown' if not provided  
    size: size || 0,  // default to 0 if not provided  
    seeders: seeders || 0,  // default to 0 if not provided  
    leechers: leechers || 0,  // default to 0 if not provided  
  });  

  return await torrent.save();  
};