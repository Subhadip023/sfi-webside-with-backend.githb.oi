const dropdrowen = document.querySelector('.dropdowen');
const navbar = document.querySelector('.navbar');
// const links = document.querySelector('.navbar ul li');
const dropdowenSvg = document.querySelector('.dropdowen ul li');
// const hn=document.querySelector('.hn');
const notification_home = document.querySelector('.notification_home');
const elements = document.querySelectorAll('.kalr_quote');
const quoteElements = document.querySelectorAll('.kalr_quote');
const imgElements = document.querySelectorAll('.quotes img');


dropdrowen.addEventListener('click', function () {
  navbar.style.display = navbar.style.display === "none" ? "block" : "none";
  if (navbar.style.display == "block") {
    dropdrowen.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="background-color: black;">
      <line x1="50" y1="50" x2="150" y2="150" stroke="white" stroke-width="25" />
      <line x1="150" y1="50" x2="50" y2="150" stroke="white" stroke-width="25" />
</svg>
    `}
  else {
    dropdrowen.innerHTML = `
      <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0,0,256,256"
      style="fill: #ffffff"
    >
      <g
        fill="#ffffff"
        fill-rule="nonzero"
        stroke="none"
        stroke-width="1"
        stroke-linecap="butt"
        stroke-linejoin="miter"
        stroke-miterlimit="10"
        stroke-dasharray=""
        stroke-dashoffset="0"
        font-family="none"
        font-weight="none"
        font-size="none"
        text-anchor="none"
        style="mix-blend-mode: normal"
      >
        <g transform="scale(3.55556,3.55556)">
          <path
            d="M56,48c2.209,0 4,1.791 4,4c0,2.209 -1.791,4 -4,4c-1.202,0 -38.798,0 -40,0c-2.209,0 -4,-1.791 -4,-4c0,-2.209 1.791,-4 4,-4c1.202,0 38.798,0 40,0zM56,32c2.209,0 4,1.791 4,4c0,2.209 -1.791,4 -4,4c-1.202,0 -38.798,0 -40,0c-2.209,0 -4,-1.791 -4,-4c0,-2.209 1.791,-4 4,-4c1.202,0 38.798,0 40,0zM56,16c2.209,0 4,1.791 4,4c0,2.209 -1.791,4 -4,4c-1.202,0 -38.798,0 -40,0c-2.209,0 -4,-1.791 -4,-4c0,-2.209 1.791,-4 4,-4c1.202,0 38.798,0 40,0z"
          ></path>
        </g>
      </g>
    </svg>
      `
  }

});
window.onload = function () {

  document.querySelector('.banner img').style.opacity = '1';
// Apply styles to each img element
imgElements.forEach(element => {
  element.style.opacity = '1';
  element.style.boxShadow = '5px 10px 28px red';
});
quoteElements.forEach(element => {
  element.style.opacity = '1';
});

// Iterate over each element and set their opacity to 1
elements.forEach(element => {
  element.style.opacity = '1';
});

  if (notificationCount != 0) {
    let i = 0;
    const intervalId = setInterval(function () {
      showNotification(notificationTitle[i]);
      if (i === notificationCount - 1) {
        clearInterval(intervalId);
      }
      i++;
    }, 2000);

  }

};

{/* <svg class='cross' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <line x1="10" y1="10" x2="90" y2="90" stroke="red" stroke-width="10"/>
  <line x1="90" y1="10" x2="10" y2="90" stroke="red" stroke-width="10"/>
</svg> */}

function showNotification(Notification_title) {
  let hn = document.createElement('div');
  hn.classList.add('hn');
  hn.innerHTML = ` 


${Notification_title}
<a href="/notification"><svg
    fill="#000000"
    height="800px"
    width="800px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 330 330"
    xml:space="preserve"
  >
    <path
      id="XMLID_222_"
      d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
  c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
  C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
  C255,161.018,253.42,157.202,250.606,154.389z"
    />
  </svg></a>`
  notification_home.appendChild(hn);
  setTimeout(() => {
    hn.classList.add('remove'); // Add the 'remove' class to trigger the fade-out and shrink animation
    setTimeout(() => {
      hn.remove(); // Remove the element after the animation completes
    }, 500); // Adjust the timeout to match the duration of the animation
  }, 5000);

}

