import { revalidatePath } from 'next/cache';
import ProtectedImageDemo from './ProtectedImageDemo'; 

export default async function Home() {
  // --- GRACEFUL FETCHING ---
  let users = [];
  try {
    const res = await fetch('http://backend:8080/api/users', { cache: 'no-store' });
    if (res.ok) {
      users = await res.json() || [];
    }
  } catch (error) {
    console.warn("⚠️ Backend is not ready yet. Retrying on next load.");
    // users remains an empty array so the page doesn't crash
  }

  // 2. The Server Action
  async function submitUser(formData) {
    'use server'; 
    
    const name = formData.get('name');
    const email = formData.get('email');
    const photoFile = formData.get('photo');

    let photoBase64 = "";

    // Convert the uploaded image file to a Base64 string
    if (photoFile && photoFile.size > 0) {
      const buffer = await photoFile.arrayBuffer();
      photoBase64 = `data:${photoFile.type};base64,${Buffer.from(buffer).toString('base64')}`;
    }

    // Send the POST request to the Go backend
    await fetch('http://backend:8080/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, photo: photoBase64 }),
    });

    revalidatePath('/');
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Matrimony App Prototype</h1>
      
      {/* The Upload Form */}
      <form action={submitUser} style={{ 
        display: 'flex', flexDirection: 'column', gap: '10px', 
        padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '30px' 
      }}>
        <input 
          type="text" name="name" placeholder="Name" required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="email" name="email" placeholder="Email Address" required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="file" name="photo" accept="image/*" required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
        />
        <button type="submit" style={{ 
          padding: '10px', background: 'blue', color: 'white', border: 'none', 
          borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          Add User
        </button>
      </form>

      {/* The Data Display */}
      <h2>Registered Users</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {users.length === 0 ? <p>No users found. Upload one to test the images!</p> : null}
        {users.map((user) => (
          <div key={user.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
            
            <p style={{ margin: '0 0 5px 0', fontSize: '20px' }}><strong>{user.name}</strong></p>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>{user.email}</p>
            
            {/* Renders the 3 test images only if a photo exists */}
            {user.photo && <ProtectedImageDemo src={user.photo} />}

          </div>
        ))}
      </div>
    </div>
  );
}