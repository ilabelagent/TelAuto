// Cloud Storage Adapter for Learning System
// Use this when deploying to Cloud Run (no persistent disk)

const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');

class CloudStorageAdapter {
  constructor(bucketName = 'telegram-bot-learning-data') {
    this.storage = new Storage();
    this.bucketName = bucketName;
    this.bucket = this.storage.bucket(bucketName);
    this.localCachePath = '/tmp/learning-data.json';
  }

  async initialize() {
    try {
      // Create bucket if it doesn't exist
      const [exists] = await this.bucket.exists();
      if (!exists) {
        await this.storage.createBucket(this.bucketName, {
          location: 'US',
          storageClass: 'STANDARD'
        });
        console.log(`✅ Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('Error initializing Cloud Storage:', error);
      throw error;
    }
  }

  async loadLearningData() {
    try {
      const file = this.bucket.file('learning-data.json');
      const [exists] = await file.exists();
      
      if (!exists) {
        console.log('No existing learning data in Cloud Storage');
        return null;
      }

      // Download to local cache
      await file.download({ destination: this.localCachePath });
      const data = await fs.readFile(this.localCachePath, 'utf8');
      console.log('✅ Loaded learning data from Cloud Storage');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading learning data:', error);
      return null;
    }
  }

  async saveLearningData(data) {
    try {
      // Save to local cache first
      await fs.writeFile(this.localCachePath, JSON.stringify(data, null, 2));
      
      // Upload to Cloud Storage
      await this.bucket.upload(this.localCachePath, {
        destination: 'learning-data.json',
        metadata: {
          contentType: 'application/json',
          metadata: {
            lastModified: new Date().toISOString()
          }
        }
      });
      
      console.log('✅ Saved learning data to Cloud Storage');
      return true;
    } catch (error) {
      console.error('Error saving learning data:', error);
      return false;
    }
  }

  async backup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backups/learning-data-${timestamp}.json`;
      
      await this.bucket.file('learning-data.json').copy(backupFile);
      console.log(`✅ Created backup: ${backupFile}`);
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }
}

module.exports = CloudStorageAdapter;
