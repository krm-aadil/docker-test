import { revalidatePath } from 'next/cache';

export default async function Home() {
  // 1. Fetch existing users from Go
  const res = await fetch('http://backend:8080/api/users', { cache: 'no-store' });
  const users = await res.json() || [];

  // 2. The Server Action: Runs on the server, not the browser
  async function submitUser(formData) {
    'use server'; // This directive is the magic that makes Server Actions work
    
    const name = formData.get('name');
    const email = formData.get('email');

    // Send the POST request to the Go backend
    await fetch('http://backend:8080/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    // Tell Next.js to refresh the page to show the new data
    revalidatePath('/');
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>Matrimony App Prototype</h1>
      
      {/* 3. The Input Form */}
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
        <button type="submit" style={{ 
          padding: '10px', background: 'blue', color: 'white', border: 'none', 
          borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          Add User
        </button>
      </form>

      {/* 4. The Data Display */}
      <h2>Registered Users</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.length === 0 ? <p>No users found.</p> : null}
        {users.map((user) => (
          <div key={user.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>{user.name}</strong></p>
            <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}