

document.addEventListener('DOMContentLoaded', function () {


    const resultList = document.getElementById('resultList');
    const resultListFragment = document.createDocumentFragment();
    const resultItem = resultList.getElementsByClassName('filter__result__item')[0];

    let cloneItem;

    for(let i = 6; i > 0; i--){
        cloneItem = resultItem.cloneNode(true);
        resultListFragment.appendChild(cloneItem);
    }

    /*console.log('resultItem: ', resultItem);
     console.log(resultListFragment);*/
    resultList.appendChild(resultListFragment);

});


function initMap() {

    const hospitalIcon = "./../img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    const doctorIcon = "./../img/doctor.png";
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: 13,
        //mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    let marker,
        allMarkers = [],
        popUpIsActive = null;

    //console.log(marker);
    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             }
        },
        {
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            }
        },
        {
            title: 'Больница1',
            position: {lat: 50.424270, lng: 30.516910},
            icon: {
                url: doctorIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            }
        },
        {
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            }
        },
        {
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            }
        },
        {
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            }
        },
    ];

    locations.forEach( function( element ) {

        marker = new google.maps.Marker({
            position: element.position,
            map: map,
            title: element.title,
            icon: element.icon,
            //animation: google.maps.Animation.BOUNCE,
        });

        allMarkers.push(marker);


    });

    allMarkers.forEach(function (item) {

        item.addListener('click', function() {

            renderPopUp(item);

        });

    });

    function renderPopUp(item) {

        //console.log('item title: ', item.title);

        if(popUpIsActive){
            popUpIsActive.close();
        }

        const {title} = item;

        let contentString = `
            <div class="popUp">
                <h3>${title}</h3>
            </div>
                
        `;

        const infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        infowindow.open(map, item);

        popUpIsActive = infowindow;

    }

    console.log('allMarkers: ', allMarkers);
    
    /*const contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
        '<div id="bodyContent">'+
        '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
        'sandstone rock formation in the southern part of the '+
        'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
        'south west of the nearest large town, Alice Springs; 450&#160;km '+
        '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
        'features of the Uluru - Kata Tjuta National Park. Uluru is '+
        'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
        'Aboriginal people of the area. It has many springs, waterholes, '+
        'rock caves and ancient paintings. Uluru is listed as a World '+
        'Heritage Site.</p>'+
        '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
        'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
        '(last visited June 22, 2009).</p>'+
        '</div>'+
        '</div>';*/





}