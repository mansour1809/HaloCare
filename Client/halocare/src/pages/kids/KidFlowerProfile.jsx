// src/components/kids/KidFlowerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { baseURL } from '../../components/common/axiosConfig';

const KidFlowerProfile = ({ kid }) => {
  const navigate = useNavigate();
  const [hoveredPetal, setHoveredPetal] = useState(null);
  
  // משיכת רשימת סוגי הטיפולים מהרדקס
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);

  // טיפול בהובר על עלה
  const handlePetalHover = (petalId) => {
    setHoveredPetal(petalId);
  };
  
  // טיפול בלחיצה על עלה/קטגוריה
  const handleCategoryClick = (category) => {
    navigate(`/kids/${kid.id}/treatments/${category.treatmentTypeId}`);
  };

  // הפונקציה שמחליטה אם להשתמש בפרח עם 5 או 6 עלים
  const renderFlower = () => {
    // אם יש 5 סוגי טיפולים או פחות, נציג את הפרח עם 5 עלים
    if (treatmentTypes.length <= 5) {
      return renderFlower5();
    }
    // אחרת, נציג את הפרח עם 6 עלים
    return renderFlower6();
  };

  // SVG עבור 5 עלים
  const renderFlower5 = () => (
    <svg width="100%" height="100%" viewBox="0 0 698 681" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* עלה 1 */}
      {treatmentTypes.length > 0 && (
        <g filter="url(#filter0_d_2144_1444)">
          <path
            id="petal1"
            d="M104.538 191.1C118.616 179.748 136.188 173.339 154.411 174.45C185.939 178.429 206.926 201.552 227.032 223.947C233.181 230.795 239.38 237.598 245.579 244.399C246.232 245.117 246.885 245.834 247.558 246.572C257.66 257.657 267.998 268.429 278.679 278.957C282.764 282.988 286.686 287.145 290.531 291.405C289.886 292.156 289.241 292.906 288.576 293.68C278.164 306.301 271.352 319.942 267.354 335.858C266.978 337.281 266.978 337.281 266.595 338.733C263.734 350.699 264.51 362.731 265.718 374.874C258.792 375.709 251.865 376.527 244.929 377.272C221.076 379.853 197.35 383.073 173.713 387.193C154.256 390.54 136.224 393.052 116.603 390.084C115.482 389.951 114.36 389.819 113.205 389.682C94.4959 386.888 79.4272 375.206 68.3427 360.514C52.0799 338.139 52.0662 307.454 55.7143 281.219C60.4179 252.643 73.1032 221.299 93.9724 200.68C94.8593 199.79 94.8593 199.79 95.7642 198.882C98.5866 196.165 101.564 193.648 104.538 191.1Z"        
            fill={hoveredPetal === "petal1" ? adjustColor(treatmentTypes[0]?.treatmentColor, 20) : treatmentTypes[0]?.treatmentColor || '#c6b1e2'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal1" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal1")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[0])}
          />
        </g>
      )}
      
      {/* עלה 2 */}
      {treatmentTypes.length > 1 && (
        <g filter="url(#filter0_d_2144_1444)">
          <path 
            id="petal2" 
            d="M204.737 439C229.991 429.159 254.588 418.005 278.824 405.884C279.597 407.059 279.597 407.059 280.387 408.257C291.355 424.741 305.096 439.609 323.014 448.566C324.567 449.348 324.567 449.348 326.152 450.145C333.167 453.5 340.376 455.955 347.756 458.377C347.528 459.198 347.301 460.02 347.066 460.866C341.472 481.184 336.688 501.539 332.581 522.207C331.708 526.59 330.806 530.967 329.899 535.343C328.656 541.35 327.426 547.357 326.311 553.389C320.886 582.69 313.121 609.871 289.209 629.519C270.856 641.588 248.45 643.982 227.279 639.611C210.049 635.683 195.277 628.136 180.279 619.011C179.185 618.358 178.091 617.704 176.964 617.03C149.651 599.393 126.854 571.352 118.793 539.572C116.657 528.966 116.022 518.948 118.464 508.321C118.683 507.345 118.901 506.369 119.127 505.364C129.209 466.465 171.256 452.02 204.737 439Z"      
                   fill={hoveredPetal === "petal2" ? adjustColor(treatmentTypes[1]?.treatmentColor, 20) : treatmentTypes[1]?.treatmentColor || '#f4b183'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal2" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal2")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[1])}
          />
        </g>
      )}
      
      {/* עלה 3 */}
      {treatmentTypes.length > 2 && (
        <g filter="url(#filter0_d_2144_1444)">
          <path 
            id="petal3" 
            d="M457.239 403.924C461.312 404.154 464.48 405.551 468.189 407.198C469.518 407.782 470.847 408.367 472.175 408.951C472.876 409.261 473.576 409.572 474.297 409.892C486.7 415.382 499.173 420.683 511.761 425.73C512.444 426.005 513.127 426.279 513.831 426.561C523.55 430.453 533.337 434.143 543.164 437.754C571.522 448.245 598.585 461.654 612.274 490.317C620.902 511.202 617.25 532.727 609.184 553.026C594.483 586.622 566.337 613.703 533.456 629.498C532.734 629.846 532.012 630.193 531.269 630.552C514.894 638.114 492.934 643.116 475.173 638.419C474.49 638.239 473.808 638.06 473.104 637.876C453.144 632.387 440.732 620.866 430.169 603.423C421.91 588.621 418.507 573.201 415.056 556.762C413.713 550.371 412.336 543.987 410.962 537.603C410.691 536.339 410.42 535.075 410.14 533.773C407.823 523 405.403 512.255 402.856 501.534C402.674 500.766 402.492 499.998 402.304 499.207C399.927 489.233 397.345 479.357 394.201 469.595C393.166 465.92 392.657 462.382 392.29 458.586C393.904 458.069 393.904 458.069 395.55 457.541C421.317 448.894 443.497 431.308 455.954 406.728C456.378 405.803 456.802 404.877 457.239 403.924Z"             fill={hoveredPetal === "petal3" ? adjustColor(treatmentTypes[2]?.treatmentColor, 20) : treatmentTypes[2]?.treatmentColor || '#dde16a'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal3" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal3")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[2])}
          />
        </g>
      )}
      
      {/* עלה 4 */}
      {treatmentTypes.length > 3 && (
        <g filter="url(#filter0_d_2144_1444)">
          <path 
            id="petal4" 
            d="M598.167 175.01C628.539 186.757 648.222 213.985 661.756 242.427C664.178 247.939 666.007 253.579 667.737 259.341C668.285 261.16 668.285 261.16 668.844 263.016C671.76 273.033 673.694 282.765 674.346 293.17C674.402 293.944 674.457 294.719 674.514 295.517C676.018 318.827 670.938 341.924 655.29 359.849C641.574 374.811 622.478 380.929 602.644 382.247C592.918 382.582 583.427 381.78 573.813 380.392C572.617 380.227 571.421 380.062 570.189 379.891C564.12 379.047 558.055 378.173 551.99 377.297C524.291 373.297 496.598 369.581 468.604 368.468C468.525 367.187 468.446 365.907 468.364 364.588C468.256 362.886 468.148 361.185 468.04 359.484C467.989 358.642 467.937 357.801 467.884 356.934C466.242 331.288 455.506 305.592 436.183 288.226C435.975 287.546 435.767 286.866 435.553 286.165C436.274 285.481 436.274 285.481 437.009 284.783C450.882 271.538 463.715 257.601 476.353 243.196C479.251 239.895 482.168 236.612 485.089 233.332C489.595 228.272 494.075 223.192 498.508 218.069C514.079 200.103 514.078 200.103 522.083 193.223C522.978 192.445 523.873 191.667 524.796 190.866C545.719 173.569 571.829 165.65 598.167 175.01Z"
            fill={hoveredPetal === "petal4" ? adjustColor(treatmentTypes[3]?.treatmentColor, 20) : treatmentTypes[3]?.treatmentColor || '#ff9f9f'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal4" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal4")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[3])}
          />
        </g>
      )}
  
      {/* עלה 5 */}
      {treatmentTypes.length > 4 && (
        <g filter="url(#filter0_d_2144_1444)">
          <path 
            id="petal5" 
            d="M336.571 46.6888C337.41 46.5212 338.249 46.3535 339.113 46.1808C363.993 41.438 388.269 42.6973 412.677 49.2503C413.705 49.5146 414.733 49.7788 415.791 50.0511C434.658 55.229 456.58 67.4115 467.16 84.488C478.795 105.864 481.314 125.219 474.473 148.772C471.718 157.375 467.561 165.449 463.374 173.428C462.679 174.754 462.679 174.754 461.971 176.107C458.666 182.348 455.138 188.407 451.42 194.409C436.928 217.808 423.667 242.214 412.027 267.155C408.012 267.296 405.257 266.369 401.575 264.821C393.366 261.726 385.226 260.75 376.547 259.918C374.989 259.762 374.989 259.762 373.4 259.602C358.616 258.663 344.481 262.394 330.747 267.434C327.13 268.693 327.13 268.693 324.722 268.627C313.77 246.079 302.856 223.513 291.993 200.923C291.006 198.869 290.018 196.816 289.03 194.763C285.785 188.015 282.557 181.26 279.36 174.49C278.437 172.542 277.51 170.596 276.577 168.652C269.828 154.58 263.491 140.183 263.639 124.248C263.634 123.467 263.63 122.686 263.625 121.881C263.739 102.33 270.728 86.433 284.25 72.3546C298.628 58.3842 317.067 50.5685 336.571 46.6888Z"           
            
            fill={hoveredPetal === "petal5" ? adjustColor(treatmentTypes[4]?.treatmentColor, 20) : treatmentTypes[4]?.treatmentColor || '#8fd3c3'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal5" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal5")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[4])}
          />
        </g>
      )}
      
      {/* העיגול המרכזי */}
      <circle cx="350" cy="330" r="80" fill="white" stroke="#eee" strokeWidth="2" />
      <path d="M442.579 401.061L442.578 401.063L441.145 403.792C441.144 403.793 441.143 403.795 441.142 403.797C437.17 410.873 432.204 416.699 426.499 422.499L426.499 422.499L424.257 424.783C407.875 440.369 384.827 447.875 362.393 447.406C340.046 445.634 318.044 436.2 302.693 419.691C285.126 398.43 279.032 375.888 280.79 348.534C282.899 329.916 292.868 311.961 306.497 299.283L306.504 299.276L306.511 299.269L308.667 297.096C337.794 268.933 386.665 266.934 418.523 292.008C436.259 306.801 449.203 326.423 452.222 349.616C453.416 368.147 451.367 384.539 442.579 401.061Z" fill="#FEFEFE" stroke="black"/>
      {/* פילטר עבור צל
      <defs>
        <filter id="filter0_d_2144_1444" x="45.7495" y="170.326" width="244.781" height="225.077" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2144_1444"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2144_1444" result="shape"/>
        </filter>
      </defs> */}
    </svg>
  );
  
  // SVG עבור 6 עלים
  const renderFlower6 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" 
    width="100%" height="100%" viewBox="0 0 641.4 609"
    style={{ backgroundColor: 'transparent' }}>
      {/* עלה 1 */}
      {treatmentTypes.length > 0 && (
        <g id="Group_1" data-name="Group 1">
          <path 
            id="petal1" 
            data-name="Path 1" 
            d="M218.493,11c18.075-.594,35.966,4.863,49.851,16.717,22.785,22.152,25.63,53.249,28.21,83.235.79,9.17,1.646,18.333,2.5,27.5.089.966.179,1.932.272,2.926,1.4,14.933,3.17,29.757,5.364,44.593.838,5.678,1.468,11.358,1.975,17.074l-2.93.64a104.42,104.42,0,0,0-42.333,20.914l-2.336,1.839c-9.486,7.835-16.108,17.91-22.45,28.336-6.034-3.5-12.058-7.017-18.047-10.6-20.6-12.294-41.489-24-62.846-34.936-17.553-9.036-33.466-17.882-47.35-32.061l-2.471-2.366c-13.261-13.491-18.265-31.889-18.276-50.293.478-27.657,18.934-52.171,37.636-70.928C146.22,33.6,175.214,16.2,204.29,12.29l2.513-.358C210.692,11.461,214.584,11.243,218.493,11Z" 
            fill={hoveredPetal === "petal1" ? adjustColor(treatmentTypes[0]?.treatmentColor, 20) : treatmentTypes[0]?.treatmentColor || '#c6b1e2'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal1" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal1")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[0])}
          />
        </g>
      )}
      
      {/* עלה 2 */}
      {treatmentTypes.length > 1 && (
        <g id="Group_2" data-name="Group 2">
          <path 
            id="petal2" 
            data-name="Path 2" 
            d="M155.408,237.178c24.42,11.758,49.353,22.14,74.746,31.6l-.669,2.762c-4.575,19.263-6.078,39.453-.409,58.666.488,1.669.488,1.669.985,3.372a178.031,178.031,0,0,0,8.714,21.414l-2.291,1.193c-18.674,9.766-36.824,20.149-54.74,31.241q-5.7,3.525-11.436,7c-5.242,3.187-10.474,6.384-15.646,9.682-25.129,16.016-50.3,28.875-80.981,24.787C52.338,423.7,35.306,408.945,24.064,390.48,15.186,375.2,10.631,359.25,7.076,342.058l-.812-3.776c-5.728-32-.767-67.8,16.978-95.37,6.3-8.795,13.194-16.092,22.631-21.553l2.614-1.533C83.811,200.671,123.052,221.571,155.408,237.178Z" 
            fill={hoveredPetal === "petal2" ? adjustColor(treatmentTypes[1]?.treatmentColor, 20) : treatmentTypes[1]?.treatmentColor || '#f4b183'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal2" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal2")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[1])}
          />
        </g>
      )}
      
      {/* עלה 3 */}
      {treatmentTypes.length > 2 && (
        <g id="Group_3" data-name="Group 3">
          <path 
            id="petal3" 
            data-name="Path 3" 
            d="M247.4,369c3.041,1.014,4.307,2.151,6.31,4.685,13.225,16.357,36.838,26.62,57.272,29.8q3.35.306,6.7.575l3.535.287,2.7.215q.589,40.233,1.049,80.468.041,3.555.083,7.11.132,11.359.2,22.721.02,3.216.056,6.433c.248,22.77-2.959,43.8-17.549,62.162l-1.385,1.991c-7.364,9.886-20.423,16.291-32.023,19.562l-3.089.969c-30.93,8.578-65.65-2.341-92.84-17.311a187.139,187.139,0,0,1-25.848-18.143l-2.85-2.307C134.264,555.081,119.7,535,117,514.486c-.932-14.142-1.093-26.993,5.389-39.874.559-1.124,1.119-2.248,1.7-3.406,4.2-7.753,9.421-14,15.546-20.3.77-.849,1.54-1.7,2.332-2.572,12.2-13.02,27.969-22.335,42.652-32.275,9.176-6.236,18.115-12.76,26.993-19.411q3.487-2.607,7-5.182c7.671-5.669,15.139-11.482,22.346-17.734C245.05,370.173,245.05,370.173,247.4,369Z" 
            fill={hoveredPetal === "petal3" ? adjustColor(treatmentTypes[2]?.treatmentColor, 20) : treatmentTypes[2]?.treatmentColor || '#dde16a'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal3" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal3")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[2])}
          />
        </g>
      )}
      
      {/* עלה 4 */}
      {treatmentTypes.length > 3 && (
        <g id="Group_4" data-name="Group 4">
          <path 
            id="petal4" 
            data-name="Path 4" 
            d="M413.358,357.146c4.015.724,6.99,2.5,10.47,4.584l3.743,2.226,1.992,1.192q17.46,10.441,35.254,20.286l1.953,1.077c9.173,5.048,18.436,9.9,27.751,14.684,26.868,13.869,52.1,30.476,62.189,60.594,6.018,21.78-.23,42.7-10.709,61.865-18.687,31.554-49.923,55-84.484,66.673l-2.3.779c-17.175,5.511-39.58,7.8-56.636.972l-1.988-.791c-19.142-7.88-30.057-20.827-38.417-39.428-6.393-15.7-7.891-31.418-9.313-48.156-.554-6.506-1.143-13.01-1.729-19.514-.115-1.288-.23-2.575-.349-3.9q-1.48-16.462-3.3-32.886c-.088-.785-.175-1.569-.265-2.377-1.143-10.189-2.5-20.307-4.433-30.379a61.414,61.414,0,0,1-.556-11.16l3.363-.639c26.629-5.444,50.787-20.2,66.147-43.074Z" 
            fill={hoveredPetal === "petal4" ? adjustColor(treatmentTypes[3]?.treatmentColor, 20) : treatmentTypes[3]?.treatmentColor || '#ff9f9f'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal4" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal4")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[3])}
          />
        </g>
      )}
      
      {/* עלה 5 */}
      {treatmentTypes.length > 4 && (
        <g id="Group_5" data-name="Group 5">
          <path 
            id="petal5" 
            data-name="Path 5" 
            d="M603.522,191.7c25.609,20.113,36.471,51.906,41.1,83.062a146.126,146.126,0,0,1,.774,17.923c-.008,1.9-.008,1.9-.016,3.839a136.761,136.761,0,0,1-3.554,30.445c-.173.757-.347,1.514-.525,2.294-5.377,22.731-16.989,43.333-37.193,55.9-17.491,10.3-37.542,10.565-56.9,6.027a161.571,161.571,0,0,1-27.029-10.2l-3.318-1.539q-8.337-3.872-16.646-7.8c-25.32-11.923-50.716-23.573-77.161-32.823.3-1.247.6-2.5.9-3.78q.591-2.489,1.183-4.976c.2-.82.393-1.639.6-2.484,5.928-25.005,3.174-52.718-10.227-74.974v-2.155l1.8-.9c17.14-8.61,33.487-18.186,49.784-28.267q5.605-3.464,11.239-6.879,8.682-5.281,17.295-10.673c20.143-12.628,20.143-12.628,29.809-16.868l3.283-1.46C553.786,174.989,581.071,175.05,603.522,191.7Z" 
            fill={hoveredPetal === "petal5" ? adjustColor(treatmentTypes[4]?.treatmentColor, 20) : treatmentTypes[4]?.treatmentColor || '#8fd3c3'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal5" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal5")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[4])}
          />
        </g>
      )}
      
      {/* עלה 6 */}
      {treatmentTypes.length > 5 && (
        <g id="Group_6" data-name="Group 6">
          <path 
            id="petal6" 
            data-name="Path 6" 
            d="M430.6,3.669l2.519.614C457.673,10.5,479.142,21.9,498.495,38.154l2.483,2.042c14.911,12.666,29.63,32.972,32,52.92,1.511,24.29-4.385,42.9-20.539,61.351-6.133,6.634-13.313,12.194-20.48,17.656l-2.4,1.835c-5.633,4.259-11.39,8.26-17.3,12.128a703.793,703.793,0,0,0-66.446,49.283c-3.7-1.57-5.8-3.574-8.487-6.534-6.132-6.274-13.1-10.6-20.611-15.02L374,212.2c-13-7.1-27.389-9.692-41.966-10.929-3.81-.387-3.81-.387-5.965-1.465q-.594-37.594-1.049-75.192-.041-3.417-.083-6.835-.133-11.23-.2-22.461-.02-3.233-.055-6.467c-.169-15.606.172-31.332,7.041-45.712.325-.71.651-1.42.987-2.151,8.366-17.671,21.418-29.125,39.623-36.17C391.27-1.767,411.285-1.058,430.6,3.669Z" 
            fill={hoveredPetal === "petal6" ? adjustColor(treatmentTypes[5]?.treatmentColor, 20) : treatmentTypes[5]?.treatmentColor || '#7ac7d7'}
            style={{ 
              transition: 'all 0.3s ease',
              transform: hoveredPetal === "petal6" ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => handlePetalHover("petal6")}
            onMouseLeave={() => handlePetalHover(null)}
            onClick={() => handleCategoryClick(treatmentTypes[5])}
          />
        </g>
      )}
      
      {/* העיגול המרכזי */}
      <path 
        id="petal7" 
        data-name="Path 7" 
        d="M403.218,342.9v0l-1.433,2.729,0,.005c-3.971,7.076-8.937,12.9-14.642,18.7h0l-2.242,2.284c-16.382,15.586-39.431,23.092-61.864,22.623-22.347-1.772-44.349-11.206-59.7-27.715-17.568-21.261-23.661-43.8-21.9-71.157,2.109-18.618,12.077-36.573,25.707-49.251l.007-.007.007-.007,2.156-2.173c29.126-28.163,78-30.161,109.856-5.088,17.736,14.793,30.68,34.415,33.7,57.608C414.055,309.987,412.006,326.379,403.218,342.9Z"
        fill="#fefefe" 
        stroke="#eee" 
        strokeWidth="1"
      />
    </svg>
  );

  // פונקציה להבהרת צבע בהובר
  const adjustColor = (color, percent) => {
    console.log(color, percent);
    if (!color) return "#cccccc";
    
    // אם הצבע הוא בפורמט הקסדצימלי
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const r = Math.min(255, Math.floor((num >> 16) * (1 + percent / 100)));
      const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + percent / 100)));
      const b = Math.min(255, Math.floor((num & 0x0000FF) * (1 + percent / 100)));
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
    
    return color;
  };

  // פוזיציות הטקסט והכפתורים לפי 5 או 6 עלים
  const getPositions = () => {
    if (treatmentTypes.length <= 5) {
      return [
        { textPos: { top: '41%', left: '20%' } }, // עלה 1
        { textPos: { top: '75%', left: '28%' } }, // עלה 2
        { textPos: { top: '75%', left: '68%' } }, // עלה 3
        { textPos: { top: '42%', left: '78%' } }, // עלה 4
        { textPos: { top: '22%', left: '48%' } }, // עלה 5
      ];
    } else {
      return [
        { textPos: { top: '15%', left: '45%' }}, // עלה 1
        { textPos: { top: '35%', left: '15%' }}, // עלה 2
        { textPos: { top: '75%', left: '35%' }}, // עלה 3
        { textPos: { top: '75%', left: '65%' }}, // עלה 4
        { textPos: { top: '35%', left: '85%' }}, // עלה 5
        { textPos: { top: '15%', left: '65%' }}, // עלה 6
      ];
    }
  };

  const positions = getPositions();

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* SVG של הפרח */}
      {renderFlower()}
      
      {/* תמונת הילד במרכז */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 10
        }}
      >
        <img 
          src={kid?.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : "https://via.placeholder.com/120"}
          alt={`${kid?.firstName || ""} ${kid?.lastName || ""}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      
      {/* כפתורים וטקסט על העלים */}
      {treatmentTypes.slice(0, Math.min(treatmentTypes.length, 6)).map((category, index) => (
        <React.Fragment key={category.treatmentTypeId}>
          {/* כותרת הקטגוריה */}
          <Typography 
            sx={{ 
              position: 'absolute',
              ...positions[index].textPos,
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center',
              fontSize: '1rem',
              width: '120px',
              zIndex: 20,
              textShadow: '0px 0px 5px rgba(255,255,255,0.8)',
              opacity: hoveredPetal === `petal${index+1}` ? 1 : 0.85,
              transition: 'all 0.3s ease'
            }}
          >
            {category.treatmentTypeName}
          </Typography>
          
          {/* כפתור פרטים נוספים */}
          <Box
            sx={{
              position: 'absolute',
              ...positions[index].buttonPos,
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          >
            <Button
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                padding: '2px 10px',
                minWidth: '100px',
                transition: 'all 0.3s ease',
                opacity: hoveredPetal === `petal${index+1}` ? 1 : 0.85,
                transform: hoveredPetal === `petal${index+1}` ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              פרטים נוספים
            </Button>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default KidFlowerProfile;