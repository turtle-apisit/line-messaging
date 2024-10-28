import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

const app = express();
app.use(express.json());

dotenv.config();

const LINE_API_URL = 'https://api.line.me/v2/bot/message/reply';
const config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
    }
};

// ฟังก์ชันหลักที่ใช้เป็น Webhook สำหรับรับข้อมูลจาก LINE
export const lineBotWebhook = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // จัดการกับเหตุการณ์ที่ได้รับจาก LINE Messaging API
    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error processing request');
        });
};

// ฟังก์ชันส่งข้อความ
function handleEvent(event) {
    // ตรวจสอบว่าบอทอยู่ในกลุ่มหรือไม่
    if (event.source.type === 'group' || event.source.type === 'room') {
        const groupId = event.source.groupId || event.source.roomId;
        console.log(`Bot added to ${event.source.type} with ID: ${groupId}`);
    }
    
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const replyText = `คุณส่งข้อความว่า: ${event.message.text}`;

    return axios.post(LINE_API_URL, {
        replyToken: event.replyToken,
        messages: [{
            type: 'text',
            text: replyText
        }]
    }, config);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
