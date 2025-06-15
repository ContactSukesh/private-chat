document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const username = document.getElementById("chat-box").dataset.username;
  const roomId = document.getElementById("chat-box").dataset.room;

  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const chatBox = document.getElementById("chat-box");

  // Format time as HH:MM
  function formatTime(date) {
    const h = `0${date.getHours()}`.slice(-2);
    const m = `0${date.getMinutes()}`.slice(-2);
    return `${h}:${m}`;
  }

  // Join the room on connect
  socket.emit("join-room", roomId);

  // Load previous messages when the page loads
  fetch("/messages")
    .then((res) => res.json())
    .then((data) => {
      data.messages.forEach((message) => {
        const [user, ...rest] = message.split(":");
        const text = rest.join(":").trim();

        const msgDiv = document.createElement("div");
        msgDiv.className = user === username ? "msg right-msg" : "msg left-msg";

        const imgDiv = document.createElement("div");
        imgDiv.className = "msg-img";
        imgDiv.innerHTML = `<i class="fas fa-user person-icon"></i>`;

        const time = formatTime(new Date());

        const bubble = document.createElement("div");
        bubble.className = "msg-bubble";
        bubble.innerHTML = `
          <div class="msg-info">
            <div class="msg-info-name">${user}</div>
            <div class="msg-info-time">${time}</div>
          </div>
          <div class="msg-text">${text}</div>
        `;

        msgDiv.appendChild(imgDiv);
        msgDiv.appendChild(bubble);
        chatBox.appendChild(msgDiv);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });

  // Handle sending a message
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    socket.emit("send_message", {
      user: username,
      message: msg,
      room: roomId
    });

    input.value = "";
  });

  // Handle receiving a message
  socket.on("receive_message", function (data) {
    const { message } = data;
    const [user, ...rest] = message.split(":");
    const text = rest.join(":").trim();

    const msgDiv = document.createElement("div");
    msgDiv.className = user === username ? "msg right-msg" : "msg left-msg";

    const imgDiv = document.createElement("div");
    imgDiv.className = "msg-img";
    imgDiv.innerHTML = `<i class="fas fa-user person-icon"></i>`;

    const time = formatTime(new Date());

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = `
      <div class="msg-info">
        <div class="msg-info-name">${user}</div>
        <div class="msg-info-time">${time}</div>
      </div>
      <div class="msg-text">${text}</div>
    `;

    msgDiv.appendChild(imgDiv);
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
