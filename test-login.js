import fetch from 'node-fetch'; // or use global fetch if node 18+

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/vehicles');
        if (res.ok) {
            const data = await res.json();
            console.log("Success! Connected to backend. Vehicles count:", data.length);
        } else {
            console.error("Backend returned error:", res.status, await res.text());
        }
    } catch (e) {
        console.error("Failed to connect to backend on port 5000:", e.message);
    }
}

test();
