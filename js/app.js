const d = document
const FirebaseAuth = firebase.auth()
const buttons = d.querySelector('#buttons')
const username = d.querySelector('#username')
let contentProtected = d.querySelector('#contentProtected')
const messageForm = d.querySelector('#messageForm')
const messageInput = d.querySelector('#messageInput')
FirebaseAuth.onAuthStateChanged(user => {
  if (user) {
    console.log(user)
    buttons.innerHTML = /*html*/`<button class="button button-dargen" id="buttonSignOut">Cerrar Sesión</button>`
    username.innerHTML = /*html*/ `
      <div class='containerUser'>
        <img class='containerUserAvatar' src='${ user.photoURL}' />
        <span>${user.displayName}</span>
      </div>
    `
    contentChat(user)
    SignOut()
    messageForm.classList = 'message-form'
  } else {
    console.error('no existe el usuario')
    buttons.innerHTML = /*html*/`<button class="button button-success" id="buttonLogin">Acceder</button>`
    username.innerHTML = 'Sin Usuario'
    Login()
    contentProtected.innerHTML = /*html*/`<p>Debes iniciar sesión</p>`
    messageForm.classList = 'message-form isNone'
  }
})
const contentChat = user => {
  //contentProtected.innerHTML = /*html*/`<p> Bienvenido ${user.email} </p>`
  const db = firebase.firestore()
  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    if (!messageInput.value.trim()) {
      console.log('input vacio')
      return
    }
    console.log(messageInput.value)
    db.collection('chat').add({
      message: messageInput.value,
      avatar: user.photoURL,
      userName: user.displayName,
      uid: user.uid,
      date: Date.now()
    })
      .then(res => { console.log('message success') })
      .catch(err => console.error(err))
    messageInput.value = ''
  })
  db.collection('chat').orderBy('date')
    .onSnapshot(query => {
      contentProtected.innerHTML = ''
      query.forEach(doc => {
        if (doc.data().uid === user.uid) {
          contentProtected.innerHTML += /*html*/`
            <article class="messageUser">
              <div class='messageInfo'>
                <span>${doc.data().message}</span>
                <img src='${doc.data().avatar}' />
              </div>
            </article>
           `
        } else {
          contentProtected.innerHTML += /*html*/ `
            <article class="messageIncoming">
                <div class='messageInfo'>
                  <img src='${doc.data().avatar}' />
                  <span>${doc.data().message}</span>
                </div>
            </article>
          `
        }
      })
    })

}
const SignOut = () => {
  const buttonSignOut = d.querySelector('#buttonSignOut')
  buttonSignOut.addEventListener('click', () => {
    FirebaseAuth.signOut()
  })
}
const Login = () => {
  const buttonLogin = d.querySelector('#buttonLogin')
  buttonLogin.addEventListener('click', async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      await FirebaseAuth.signInWithPopup(provider)

    } catch (error) {
      console.error(error)
    }
  })
}
