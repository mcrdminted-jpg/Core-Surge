// Firebase Cloud Functions configuration
// Deploy: firebase deploy --only functions

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const cors = require('cors');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// CORS middleware
const corsMiddleware = cors({ origin: true });

// ============================================
// 1. SYNC SAVE (POST /api/save)
// ============================================
exports.syncSave = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      // Verify Firebase token
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        res.status(401).send('Unauthorized: No token');
        return;
      }

      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      const { gameState } = req.body;
      if (!gameState) {
        res.status(400).send('Missing gameState in request body');
        return;
      }

      // Save to Firestore
      const saveRef = db.collection('player_saves').doc(userId).collection('saves').doc();
      await saveRef.set({
        gameState,
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        towers: gameState.towers || [],
        enemies: gameState.enemies || [],
        waves: gameState.waves || [],
        resources: gameState.resources || {},
        level: gameState.level || 0,
        score: gameState.score || 0
      });

      res.status(200).json({
        saveId: saveRef.id,
        lastSyncAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('syncSave error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 2. REFRESH SAVE (GET /api/save)
// ============================================
exports.refreshSave = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        res.status(401).send('Unauthorized: No token');
        return;
      }

      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get latest save
      const snapshot = await db
        .collection('player_saves')
        .doc(userId)
        .collection('saves')
        .orderBy('lastSyncAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        res.status(404).json({ message: 'No save found' });
        return;
      }

      const doc = snapshot.docs[0];
      res.status(200).json({
        saveId: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error('refreshSave error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 3. GET LEADERBOARD (GET /api/leaderboard/:tournamentId)
// ============================================
exports.getLeaderboard = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const tournamentId = req.query.tournamentId;
      if (!tournamentId) {
        res.status(400).send('Missing tournamentId query parameter');
        return;
      }

      const doc = await db.collection('tournament_brackets').doc(tournamentId).get();
      if (!doc.exists) {
        res.status(404).json({ message: 'Tournament not found' });
        return;
      }

      const data = doc.data();
      const leaderboard = (data.players || [])
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);

      res.status(200).json({
        tournamentId,
        leaderboard,
        totalPlayers: data.players?.length || 0,
        roundEnds: data.roundEnds
      });
    } catch (error) {
      console.error('getLeaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 4. SUBMIT TOURNAMENT (POST /api/tournament/join)
// ============================================
exports.submitTournament = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        res.status(401).send('Unauthorized: No token');
        return;
      }

      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      const { tournamentId, username, score } = req.body;
      if (!tournamentId) {
        res.status(400).send('Missing tournamentId');
        return;
      }

      // Add player to tournament bracket
      const bracketRef = db.collection('tournament_brackets').doc(tournamentId);
      await bracketRef.update({
        players: admin.firestore.FieldValue.arrayUnion({
          userId,
          username: username || 'Anonymous',
          score: score || 0,
          joinedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      });

      res.status(200).json({
        tournamentId,
        message: 'Joined tournament successfully'
      });
    } catch (error) {
      console.error('submitTournament error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 5. PROCESS IAP WEBHOOK (POST /api/iap/webhook)
// ============================================
exports.processIAP = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      // In production: verify RevenueCat signature here
      // For now: basic webhook handling

      const { user_id, product_id, transaction_id, status, currency, price } = req.body;

      if (!user_id || !transaction_id) {
        res.status(400).send('Missing required fields');
        return;
      }

      // Log transaction
      await db.collection('iap_transactions').doc(transaction_id).set({
        userId: user_id,
        productId: product_id,
        revenueCatId: transaction_id,
        amount: price || 0,
        currency: currency || 'USD',
        status: status || 'pending',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Grant item to user (if purchase completed)
      if (status === 'completed' || status === 'purchased') {
        // Update user's premium status or inventory
        await db.collection('users').doc(user_id).update({
          iapReceipts: admin.firestore.FieldValue.arrayUnion(transaction_id),
          lastIAPAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      res.status(200).json({ success: true, transactionId: transaction_id });
    } catch (error) {
      console.error('processIAP error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 6. PROCESS TOURNAMENT ROUND (Scheduled)
// ============================================
exports.processTournamentRound = functions.pubsub
  .schedule('every 72 hours')
  .onRun(async (context) => {
    try {
      // Fetch all active tournaments
      const snapshot = await db.collection('tournament_brackets').get();

      snapshot.forEach(async (doc) => {
        const data = doc.data();
        const roundEnds = new Date(data.roundEnds?.toDate?.() || 0);

        // If round is ending soon, calculate winners
        if (roundEnds <= new Date()) {
          const players = data.players || [];
          const winner = players.sort((a, b) => b.score - a.score)[0];

          if (winner) {
            // Award prize (in-game currency or cosmetic)
            await db.collection('users').doc(winner.userId).update({
              tournamentWins: admin.firestore.FieldValue.increment(1),
              lastWinAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }

          // Mark tournament as completed
          await doc.ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`Tournament ${doc.id} completed. Winner: ${winner?.username}`);
        }
      });

      return null;
    } catch (error) {
      console.error('processTournamentRound error:', error);
      return null;
    }
  });

module.exports = {
  syncSave: exports.syncSave,
  refreshSave: exports.refreshSave,
  getLeaderboard: exports.getLeaderboard,
  submitTournament: exports.submitTournament,
  processIAP: exports.processIAP,
  processTournamentRound: exports.processTournamentRound
};
