const socket = io();
//elements
const form = document.querySelector('form');
const loc = document.querySelector('#location');
const send = document.querySelector('#send');
const formInp = document.querySelector('#inp');
const messages = document.querySelector('#messages');
const locationLink = document.querySelector('#locationlink')
const sidebar = document.querySelector('#sidebar');
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => { //to show recent msg, and if not watching recent msg stop scrolling
    const newMsg = messages.lastElementChild //recent msg el

    //height of new msg
    const newMsgStyles = getComputedStyle(newMsg);
    const newMsgMargin = parseInt(newMsgStyles.marginBottom);// get the margin value using window object getcomputedstyle
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin;//doesnt consider margin

    //visible Height
    const visibleHeight = messages.offsetHeight;

    //height of msg container
    const containerHeight = messages.scrollHeight;

    //how far scrolled 
    const scrollOffset = messages.scrollTop + visibleHeight; //amt of dist from top


    if (containerHeight - newMsgHeight <= scrollOffset) {//if we are near bottom
        messages.scrollTop = messages.scrollHeight;//pushes us to bottom
    }

}

socket.on('roomInfo', (ob) => {
    const html = Mustache.render(sidebarTemplate, {
        room: ob.room,
        users: ob.users
    })
    sidebar.innerHTML = html;
})

//console.log(room);
socket.on('msg', (msg) => {
    //console.log(msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        CreatedAt: moment(msg.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})
//console.log(send)
socket.on('location', (ob) => {//listening to location event from server
    console.log(ob);
    const html = Mustache.render(locationmessagetemplate, {
        username: ob.username,
        url: ob.url,
        CreatedAt: moment(ob.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

form.addEventListener(('submit'), (evt) => {//sends message on clicking on send
    evt.preventDefault();
    send.setAttribute('disabled', 'disabled');//button disabled after sending msg
    const inp = evt.target.elements.msg;
    socket.emit('msgsent', inp.value, (error) => {

        formInp.value = '';
        formInp.focus();
        send.removeAttribute('disabled');//send btn enabled after msg delivered
        if (error) {
            console.log(error);
        }
        else {
            console.log('message delivered');
        }
    });
})

loc.addEventListener('click', (evt) => {
    if (!navigator.geolocation) {
        return alert('geolocation is supported');
    }
    loc.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);
        socket.emit('loc', position.coords.latitude, position.coords.longitude, () => {
            loc.removeAttribute('disabled');
            console.log('location delivered');


        });
    })
})


socket.emit('join', { username, room }, (error) => { //join event emitted from client side
    if (error) {
        alert(error)
        location.href = '/'
    }

})

