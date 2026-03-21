const { Client } = require('pg');
const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const client = new Client({
  user: 'user',
  host: 'localhost',
  database: 'vocabdb',
  password: 'password',
  port: 5432,
});

async function migrate() {
  try {
    console.log("🔗 Đang kết nối tới PostgreSQL (localhost:5432)...");
    await client.connect();
    console.log("✅ Kết nối PostgreSQL thành công!");

    // 1. Chuyển đổi dữ liệu Sessions
    console.log("⏳ Bắt đầu đọc dữ liệu bảng Sessions...");
    const sessionsRes = await client.query('SELECT * FROM sessions');
    let sessionCount = 0;
    
    for (let row of sessionsRes.rows) {
      const sessionId = row.id.toString();
      const sessionRef = db.collection('sessions').doc(sessionId);
      await sessionRef.set({
        id: sessionId,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        status: row.status,
        topic: row.topic,
        wordCount: row.word_count
      });
      sessionCount++;
    }
    console.log(`✅ Đã đẩy ${sessionCount} Sessions lên Firestore.`);

    // 2. Chuyển đổi dữ liệu Words
    console.log("⏳ Bắt đầu đọc dữ liệu bảng Words...");
    const wordsRes = await client.query('SELECT * FROM words');
    let wordCount = 0;

    for (let row of wordsRes.rows) {
      const wordId = row.id.toString();
      const sessionId = row.session_id.toString();
      const wordRef = db.collection('words').doc(wordId);
      
      await wordRef.set({
        id: wordId,
        sessionId: sessionId,
        english: row.english,
        vietnamese: row.vietnamese,
        orderIndex: row.order_index,
        userAnswer: row.user_answer || null,
        correct: row.correct === true || row.correct === false ? row.correct : null,
        imageUrl: row.image_url || null
      });
      wordCount++;
    }
    console.log(`✅ Đã đẩy ${wordCount} Words lên Firestore.`);
    
    console.log("🎉 Hoàn tất quá trình Migrate từ Postgres -> Firebase Firestore!");

  } catch (err) {
    console.error("❌ Migrate thất bại. Vui lòng kiểm tra xem Docker/Postgres của bạn đã bật chưa:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
