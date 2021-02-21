

const socket = io();

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $secls
ndLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages');


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
   
   
    $messages.scrollTop = $messages.scrollHeight

}

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        username : message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('hh:mm a')

    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomData',({room , users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    //console.log(room);
    //console.log(user);
    document.querySelector('#sidebar').innerHTML = html;
})

document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable
     $messageFormButton.setAttribute('disabled','disabled')


    //const message = document.querySelector('input').value;
    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error)
         return console.log(error);

        console.log('Message was delivered' );
    });
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation)
     return alert('Geolocation is not supported by ur browser');
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
           // console.log(position);
            $sendLocationButton.removeAttribute('disabled');

            socket.emit('sendLocation',{
                 latitude: position.coords.latitude,
                 longitude:position.coords.longitude
            },()=>
              console.log('Location is delivered')
            )
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        //redirect to join page
        location.href = '/';
    }
})