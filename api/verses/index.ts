import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getVerses(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Get verses request`);
    
    try {
        // Get user email from header (dev mode) or JWT
        const userEmail = request.headers.get('x-user-email') || 'test@example.com';
        
        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: userEmail }
        });
        
        if (!user) {
            user = await prisma.user.create({
                data: { email: userEmail }
            });
        }
        
        // Get verses for user
        const verses = await prisma.verse.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        
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
        const body = await request.json() as any;
        const userEmail = request.headers.get('x-user-email') || 'test@example.com';
        
        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: userEmail }
        });
        
        if (!user) {
            user = await prisma.user.create({
                data: { email: userEmail }
            });
        }
        
        // Create verse
        const verse = await prisma.verse.create({
            data: {
                reference: body.reference,
                text: body.text,
                translation: body.translation || 'ESV',
                userId: user.id
            }
        });
        
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
