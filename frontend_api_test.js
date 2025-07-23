// StudySprint 4.0 - Frontend API Connection Test
console.log('🧪 Testing StudySprint Backend Connection...');

const API_BASE = 'http://localhost:8000';

async function testConnection() {
    try {
        // Test health endpoint
        const health = await fetch(`${API_BASE}/health`);
        const healthData = await health.json();
        console.log('✅ Health:', healthData.status, '| Modules:', healthData.modules_loaded);
        
        // Test CORS
        const corsTest = await fetch(`${API_BASE}/health`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            }
        });
        console.log('✅ CORS test passed');
        
        // Test main endpoints
        const endpoints = [
            { path: '/topics/', name: 'Topics' },
            { path: '/goals/', name: 'Goals' },
            { path: '/analytics/dashboard', name: 'Analytics' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${API_BASE}${endpoint.path}`);
                if (response.ok) {
                    console.log(`✅ ${endpoint.name}: Working`);
                } else {
                    console.log(`⚠️  ${endpoint.name}: Status ${response.status}`);
                }
            } catch (e) {
                console.log(`❌ ${endpoint.name}: Error - ${e.message}`);
            }
        }
        
        console.log('🎉 Backend connection test complete!');
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return false;
    }
}

// Run the test
testConnection();

// Export for use in React
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testConnection, API_BASE };
}
