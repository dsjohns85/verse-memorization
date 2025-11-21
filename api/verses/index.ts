import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

// Simple database connection
function getDb(): Database.Database {
    const dbPath = process.env.DATABASE_PATH || "./data/verses.db";
    const db = new Database(dbPath);
    
    // Initialize schema if needed
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS verses (
            id TEXT PRIMARY KEY,
            reference TEXT NOT NULL,
            text TEXT NOT NULL,
            translation TEXT DEFAULT 'ESV',
            userId TEXT NOT NULL,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_verses_userId ON verses(userId);
    `);
    
    return db;
}

export async function getVerses(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Get verses request`);
    
    try {
        const db = getDb();
        const userEmail = request.headers.get('x-user-email') || 'test@example.com';
        
        // Find or create user
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail) as any;
        
        if (!user) {
            const userId = randomUUID();
            const now = Date.now();
            db.prepare('INSERT INTO users (id, email, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
                .run(userId, userEmail, now, now);
            user = { id: userId, email: userEmail };
        }
        
        // Get verses for user
        const verses = db.prepare('SELECT * FROM verses WHERE userId = ? ORDER BY createdAt DESC')
            .all(user.id);
        
        db.close();
        
        return {
            status: 200,
            jsonBody: verses
        };
    } catch (error) {
        context.error('Error getting verses:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to get verses' }
        };
    }
}

export async function createVerse(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Create verse request`);
    
    try {
        const db = getDb();
        const body = await request.json() as any;
        const userEmail = request.headers.get('x-user-email') || 'test@example.com';
        
        // Find or create user
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail) as any;
        
        if (!user) {
            const userId = randomUUID();
            const now = Date.now();
            db.prepare('INSERT INTO users (id, email, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
                .run(userId, userEmail, now, now);
            user = { id: userId, email: userEmail };
        }
        
        // Create verse
        const verseId = randomUUID();
        const now = Date.now();
        db.prepare(`
            INSERT INTO verses (id, reference, text, translation, userId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            verseId,
            body.reference,
            body.text,
            body.translation || 'ESV',
            user.id,
            now,
            now
        );
        
        const verse = db.prepare('SELECT * FROM verses WHERE id = ?').get(verseId);
        db.close();
        
        return {
            status: 201,
            jsonBody: verse
        };
    } catch (error) {
        context.error('Error creating verse:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to create verse' }
        };
    }
}

app.http('verses-get', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'verses',
    handler: getVerses
});

app.http('verses-post', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'verses',
    handler: createVerse
});
