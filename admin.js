// Connect to the WebSocket server
const socket = io();

// Listen for new suggestions
socket.on('newSuggestion', (suggestion) => {
  const suggestionList = document.getElementById('suggestion-list');
  const listItem = document.createElement('li');
  listItem.textContent = suggestion;
  suggestionList.appendChild(listItem);
});