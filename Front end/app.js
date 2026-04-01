async function sendRequest() {
  const text = document.getElementById('inputBox').value;
  const response = await fetch('/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ text })
  });
  const data = await response.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}
