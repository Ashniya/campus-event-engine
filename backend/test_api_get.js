const http = require('http');

http.get('http://localhost:5000/api/events', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API events response (first event with registrations):');
      const eventWithReg = json.find(e => e.registeredUsers && e.registeredUsers.length > 0);
      if (eventWithReg) {
        console.log(JSON.stringify(eventWithReg, null, 2));
      } else {
        console.log('No events with registrations found in API response.');
        console.log('First event:', JSON.stringify(json[0], null, 2));
      }
    } catch (err) {
      console.error('Failed to parse API response:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('API request error:', err.message);
});
