
async function testPlaylist() {
    const API_URL = 'http://localhost:3000';

    try {
        console.log('1. Creating Playlist...');
        const createRes = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Mixed Playlist',
                items: [
                    { url: '/uploads/video.mp4', duration: 0, type: 'video', filename: 'video.mp4' },
                    { url: '/uploads/image.jpg', duration: 10, type: 'image', filename: 'image.jpg' }
                ]
            })
        });
        const createData = await createRes.json();
        console.log('Created:', createData);
        const id = createData.id;

        console.log('2. Fetching Playlist...');
        const getRes = await fetch(`${API_URL}/playlists/${id}`);
        const getData = await getRes.json();
        console.log('Fetched:', getData);

        if (getData.items.length === 2 && getData.items[1].duration === 10) {
            console.log('SUCCESS: Playlist items structure verified.');
        } else {
            console.error('FAILURE: Playlist items structure mismatch.');
        }

        console.log('3. Updating Playlist...');
        const updateRes = await fetch(`${API_URL}/playlists/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [
                    { url: '/uploads/image.jpg', duration: 15, type: 'image', filename: 'image.jpg' },
                    { url: '/uploads/video.mp4', duration: 0, type: 'video', filename: 'video.mp4' }
                ]
            })
        });
        const updateData = await updateRes.json();
        console.log('Updated:', updateData);

        if (updateData.items[0].duration === 15) {
            console.log('SUCCESS: Playlist update verified.');
        } else {
            console.error('FAILURE: Playlist update mismatch.');
        }

        // Cleanup
        await fetch(`${API_URL}/playlists/${id}`, { method: 'DELETE' });
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Error:', error);
    }
}

testPlaylist();
