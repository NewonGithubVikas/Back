const mongoose = require('mongoose');
// const uri="mongodb://localhost:27017/Red";
const uri = process.env.DB_URL;
const staticContentSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ['PrivacyPolicy', 'TermsAndConditions', 'AboutUs'],
        required: true,
    },
    content: {
        type: String,
    },
    },
    {
        timestamps: true // Enable timestamps
    });

const StaticContent = mongoose.model('StaticContent', staticContentSchema);
module.exports = StaticContent;

const defaultContent = [
    {
        title: 'PrivacyPolicy',
        content: 'Default Privacy Policy content.'
    },
    {
        title: 'TermsAndConditions',
        content: 'Default Terms and Conditions content.'
    },
    {
        title: 'AboutUs',
        content: 'Default About Us content.'
    },

]; 


async function insertDefaultContent() {
    try {
        await mongoose.connect(uri);
        console.log('Database connection successful');

        for (const content of defaultContent) {
            const exists = await StaticContent.findOne({ title: content.title });
            if (!exists) {
                await StaticContent.create(content);
                console.log(`Default content for ${content.title} inserted successfully.`);
            } else {
                console.log(`Content for ${content.title} already exists. Skipping insertion.`);
            }
        }

        console.log('Default content check and insertion completed.');
    } catch (error) {
        console.error('Error inserting default content:', error);
    } 
}

insertDefaultContent();