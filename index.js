import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  doc,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyDyA3VIrT22foCi40Kv0EznYagVXjK6H1A",
  authDomain: "foodmap-6ad3e.firebaseapp.com",
  projectId: "foodmap-6ad3e",
  storageBucket: "foodmap-6ad3e.appspot.com",
  messagingSenderId: "853997365115",
  appId: "1:853997365115:web:d88a912a3e7473f8c13fde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let lat;
let lng;

// 新規登録の処理
$('#signupBtn').on('click', () => {
  const username = $('#signupName').val();
  const email = $('#signupMail').val();
  const password = $('#signupPass').val();
  const password2 = $('#signupPass2').val();
  // 入力内容の漏れ確認
  if (username === '' || email === '' || password === '') {
    $('.error').text('ユーザー名、メールアドレス、パスワードを入力してください');
    return
  }
  // パスワード確認
  if (password !== password2) {
    $('.error').text('パスワードと確認用パスワードが一致しません。');
    return
  }
  // メールアドレス、パスワードの登録
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 登録成功後に起こる処理
      const user = userCredential.user;
      // Firestoreにユーザー名、メールアドレス、uidを保存する
      addDoc(collection(db, 'users'), {
        username: username,
        email: user.email,
        uid: user.uid
      })
      alert('登録が完了しました。')
      $('#signupMail').val('');
      $('#signupPass').val('');
      $('.signup').hide();
      $('.login').fadeIn();
      $('.error').text('');
    })
    .catch((error) => {
      const errorCode = error.code;
      // メールアドレスの形じゃなかったエラー
      // すでに登録してある情報だったエラー
      if (errorCode === 'auth/invalid-email') {
        $('.error').text('メールアドレスの形で入力し、登録してください。');
        return
      } else if (errorCode === 'auth/email-already-in-use') {
        $('.error').text('現在すでに登録されています。ログインをするか別のメールアドレスで登録してください。');
        return
      }
    });
});

// ---------------------------------------------------- ログインの処理
let uid;
$('#loginBtn').on('click', () => {
  const email = $('#loginMail').val();
  const password = $('#loginPass').val();
  if (email === '' || password === '') {
    $('error').text('メールアドレス、パスワードを入力してください')
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // const user = userCredential.user;
      // console.log(user.email);
      // ログイン成功時に起こる処理
      $('#loginMail').val('');
      $('#loginPass').val('');
      $('#mypage').hide();
      $('.mypage').fadeIn();
      $('.back').hide();
      $('.login').hide();
      $('.top').hide();
      $('.logout').fadeIn();
      $('#home').fadeIn();
      $('header').fadeIn();
      $('#map').show();
      $('.error').text('');
      onAuthStateChanged(auth, (user) => {
        if (user) {
          uid = user.uid;
        }
        })
      })
        .catch((error) => {
          const errorCode = error.code;
          // メールアドレスの形じゃなかったエラー
          // 登録されていないメールアドレスだったエラー
          // メールアドレスはあるが、パスワードが違うエラー
          if (errorCode === 'auth/invalid-email') {
            $('.error').text('メールアドレスの形で入力し、ログインしてください。');
            return
          } else if (errorCode === 'auth/user-not-found') {
            $('.error').text('登録されていないメールアドレスです。');
          } else if (errorCode === 'auth/wrong-password') {
            $('.error').text('パスワードが違います。');
            return
          }
        });
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          console.log(uid);
        }
      })
    });



// ログアウトの処理
$('#logout').on('click', () => {
  signOut(auth)
    .then(() => {
      alert('ログアウトしました。');
      $('#home').hide();
      $('header').hide();
      $('#mypage').hide();
      $('#map').hide();
      $('.logout').hide();
      $('.login').fadeIn();
      $('.top').fadeIn();
      $('.item').remove();
      dataList = [];
      mypageArray = [];
    })
    .catch((error) => {
      console.log(error);
      alert(error);
    })
})






// 初期のMapの表示
const mapsInit = (position) => {
  // console.log(position);
  // console.log(position.coords.latitude);
  // console.log(position.coords.longitude);
  lat = position.coords.latitude;
  lng = position.coords.longitude;
  const map = new Microsoft.Maps.Map("#map", {
    center: {
      latitude: lat,
      longitude: lng,
    },
    zoom: 15,
  });
  pushPin(lat, lng, map);
};
const showError = (error) => {
  const errorMessage = [
    "位置情報が許可されていません。",
    "現在位置を特定出来ません。",
    "位置情報を取得する前にタイムアウトになりました。"
  ];
  alert(`error: ${errorMessage[error.code - 1]}`)
};
const option = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};
function pushPin(lat, lng, map) {
  const location = new Microsoft.Maps.Location(lat, lng);
  const pin = new Microsoft.Maps.Pushpin(location, {
    color: "red",
    visible: true,
  });
  map.entities.push(pin);
}
window.onload = () => {
  navigator.geolocation.getCurrentPosition(mapsInit, showError, option)
}




// ホットペッパー API フォームの内容で店の情報を取得し、表示する
let dataList = [];
$('#submit').on('click', () => {
  dataList = [];
  $.ajax({
    // APIのフロントエンド
    url: 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/',
    // JSONPを使う場合の指定
    dataType: 'jsonp',
    data: {
      key: '96f9093dd861b47d',
      address: $('#address').val(),
      name_any: $('#form').val(),
      keyword: $('#keyword').val(),
      format: 'jsonp'
    },
    // レスポンスが返ってきたときの処理
    success: (json) => {
      // 得られる情報の確認
      console.log(json);
      // 必要な内容だけ確認
      // console.log(json.results.shop[0].lat)
      // console.log(json.results.shop[0].lng)
      // console.log(json.results.shop[0].name)
      // console.log(json.results.shop[0].logo_image)
      // console.log(json.results.shop[0].catch)
      // console.log(json.results.shop[0].non_smoking)
      // console.log(json.results.shop[0].urls.pc)
      // console.log(json.results.shop[0].address)
      let htmlElements = [];
      const jsonData = json.results;
      jsonData.shop.map((x, i) => {
        const data = {
          name: x.name,
          address: x.address,
          catch: x.catch,
          smoke: x.non_smoking,
          img: x.photo.pc.l,
          url: x.urls.pc,
          lat: x.lat,
          lng: x.lng
        }
        dataList.push(data);
        htmlElements.push(`
          <div class="item">
            <img src="${x.photo.pc.l}">
            <div class="sentence">
              <ul>
                <li class="name">店舗名</li>
                <li>${x.name}</li>
              </ul>
              <ul>
                <li class="name">アクセス</li>
                <li>${x.address}</li>
              </ul>
              <p>${x.catch}</p>
              <p>${x.non_smoking}</p>
              <div class="flex">
                <a href="${x.urls.pc}" target="_blank">
                  <img src="./ダウンロード.png">
                </a>
                <div class="btnBlock">
                  <button class="btn btn${i}" value=${i}>地図へ表示</button>
                  <button class="mypageBtn mypageBtn${i}" value=${i}>マイページに追加</button>
                </div>
              </div>
            </div>
          </div>
        `)
      });
      $('#home .shops').html(htmlElements);
    },
    error: function (error) {
      console.log(error);
    }
  });
})


// クリック処理で位置情報を取得し、地図に表示する
$('.shops').on('click', '.btn', (e) => {
  const mapsInit = () => {
    lat = dataList[e.target.value].lat;
    lng = dataList[e.target.value].lng;
    const map = new Microsoft.Maps.Map("#map", {
      center: {
        latitude: lat,
        longitude: lng,
      },
      zoom: 17,
    });
    pushPin(lat, lng, map)
  }
  const showError = (error) => {
    const errorMessage = [
      "位置情報が許可されていません。",
      "現在位置を特定出来ません。",
      "位置情報を取得する前にタイムアウトになりました。"
    ];
    alert(`error: ${errorMessage[error.code - 1]}`)
  }
  const option = {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }

  function pushPin(lat, lng, map) {
    const location = new Microsoft.Maps.Location(lat, lng);
    const pin = new Microsoft.Maps.Pushpin(location, {
      color: "red",
      visible: true,
    });
    map.entities.push(pin);
  }
  navigator.geolocation.getCurrentPosition(mapsInit, showError, option);
})



// マイページに追加ボタンを押したときにFirebaseにデータを追加する
let mypageArray = {
  data: []
};
let documentId;
$('.shops').on('click', '.mypageBtn', (e) => {
  getDocs(query((collection(db, 'users')), where('uid', '==', uid)))
    .then(async snapshot => {
      console.log(snapshot);
      snapshot.forEach(doc => {
        return documentId = doc.id;
      })
      const docRef = doc(db, 'users', documentId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());
      if (docSnap.data().data) {
        mypageArray.data = [];
        for (let i = 0; i < docSnap.data().data.length; i++) {
          mypageArray.data.push(docSnap.data().data[i])
        }
        console.log(mypageArray)
      }
    })
    .then(() => {
      mypageArray.data.push(dataList[e.target.value]);
      console.log(mypageArray);
      getDocs(query((collection(db, 'users')), where('uid', '==', uid)))
        .then(snapshot => {
          snapshot.forEach(doc => {
            console.log(`${doc.id}`);
            return documentId = doc.id;
          })
        })
        .then(() => {
          console.log(mypageArray)
          setDoc(doc(db, 'users', documentId),
            { data: mypageArray.data }, { merge: true });
        })
  })
})


// マイページに移動したときの関数
let mypageHtmlElements = [];
$('.mypage').on('click', () => {
  mypageHtmlElements = [];
  $('#home').hide();
  $('.mypage').hide();
  $('.back').fadeIn();
  $('#mypage').fadeIn();
  getDocs(query((collection(db, 'users')), where('uid', '==', uid)))
    .then(async snapshot => {
      console.log(snapshot);
      snapshot.forEach(doc => {
        return documentId = doc.id;
      })
      const docRef = doc(db, 'users', documentId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());
      docSnap.data().data.map((x, i) => {
        mypageHtmlElements.push(`
          <div class="item">
            <img src="${x.img}">
            <div class="sentence">
              <ul>
                <li class="name">店舗名</li>
                <li>${x.name}</li>
              </ul>
              <ul>
                <li class="name">アクセス</li>
                <li>${x.address}</li>
              </ul>
              <p>${x.catch}</p>
              <p>${x.smoke}</p>
              <div class="flex">
                <a href="${x.url}" target="_blank">
                  <img src="./ダウンロード.png">
                </a>
                <div class="btnBlock">
                  <button class="btn btn${i}" value=${i}>地図へ表示</button>
                </div>
              </div>
            </div>
          </div>
        `)
      })
      $('#mypage .shops').html(mypageHtmlElements);
    })
})



// HOMEに戻るボタンを押した後起きる関数
$('.back').on('click', () => {
  $('.back').hide();
  $('.mypage').fadeIn();
  $('#mypage').hide();
  $('#home').fadeIn();
})








// ------------------------- login ------------------------------
$('.signupLink').on('click', () => {
  $('.login').hide();
  $('.signup').fadeIn();
})

// ------------------------- signup ------------------------------
$('.loginLink').on('click', () => {
  $('.signup').hide();
  $('.login').fadeIn();
})

