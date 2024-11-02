const APP_ID= "22da7de4ed234ba0b942535195b26b18"
const TOKEN = "007eJxTYDhQX5pycpNLh8XkiAWbi1fe6V7dlvzeLaMxddPrsywnrpoqMBgZpSSap6SapKYYGZskJRokWZoYmRqbGlqaJhmZJRla3NRUS28IZGQoDqxgZGSAQBCflyGgKLMyMa84o9Q5I7GEgQEAHZAkOA=="
const CHANNEL = "PriyanshuChat"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
let localTracks =[]
let remoteUsers = {}

let joinAndDisplayLocalStream = async()=>{
    client.on('user-published', handleUserJoined) 
    client.on('user-left', handleUserLeft)
    let UID = await client.join(APP_ID,CHANNEL,TOKEN, null)
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `<div class= "video-container" id="user-container-${UID}">
        <div class="video-player" id="user-${UID}"></div>
    </div>`
    document.getElementById('videobox').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}
let joinStream = async ()=> {
    await joinAndDisplayLocalStream()
    document.getElementById('joinbtn').style.display='none'
    document.getElementById('controls').style.display-'flex'
}

let handleUserJoined = async(user,mediaType) =>{
    remoteUsers[user.uid]=user
    await client.subscribe(user, mediaType)
    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player !=null){
            player.remove()
        }
        player = `<div class="video-container" id="user-container-${user.uid}">
            <div class="video-player" id="user-${user.uid}"></div>
        </div>`
        document.getElementById('videobox').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType ==='audio'){
        user.audioTrack.play()
    }
    

}
let handleUserLeft = async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}
let leaveAndRemoveLocalStream = async()=>{
    for(let i =0; localTracks.length>i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    document.getElementById('joinbtn').style.display='block'
    document.getElementById('controls').style.display='none'
    document.getElementById('wrap').innerHTML=''
}
let toggleMic = async (e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText='Mic On'
        e.target.style.backgroundColor ="cadetblue"
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.innerText= 'Mic Off'
        e.target.style.backgroundColor ='red'
    }
}
let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera On'
        e.target.style.backgroundColor = 'cadetblue'

    }
    else{
        await localTracks[1].setMuted(true)
            e.target.innerText='Camera Off'
            e.target.style.backgroundColor ='red'
        }
    }

document.getElementById('joinbtn').addEventListener('click', joinStream)
document.getElementById('leave').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic').addEventListener('click', toggleMic)
document.getElementById('camera').addEventListener('click', toggleCamera)