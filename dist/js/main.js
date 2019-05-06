
(function($) {
    $(function() {

        // jQuery Form Styler
        // http://dimox.name/jquery-form-styler
         $('.filter__radio').styler();

    });
})(jQuery);
/*

    statusOfAppIsSearch = !statusOfAppIsSearch;
    console.log('statusOfAppIsSearch: ', statusOfAppIsSearch);

*/

function initMap() {

    // Search
    const searField = document.getElementById('searchField');
    const searchClear = document.getElementById('searchClear');

    // Filter
    const filterWrap = document.getElementById('filter');
    const filterBlock = document.getElementsByClassName('filter__header__inner'); // Search or Direction
    const filterParams = document.getElementsByClassName('js-filter-params')[0];
    const filterParamsClose = document.getElementsByClassName('js-filter-params-close')[0];
    const filterParamsBasicBtn = document.getElementsByClassName('js-params-basic-btn'); // Clinic or Doctor
    const filterToggleBtn = document.getElementsByClassName('filter__toggle')[0]; // Toggle filter
    const filterParamsWrap = document.getElementsByClassName('js-filter-params-wrap')[0];
    const filterToggleListBtn = document.getElementsByClassName('js-toggle-filters-list')[0]; // Toggle additional filter

    // Direction
    const directionToField = document.getElementById('directionTo');
    const directionFromField = document.getElementById('directionFrom');
    const directionFields = document.getElementsByClassName('direction-field'); // both fields

    // Google map
    const hospitalIcon = "./img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    const doctorIcon = "./img/doctor.png";
    const doctorIconWidth = 26;
    const doctorIconHeight = 33.8;
    const directionFromIcon = "./img/directionFromIcon.png";
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: 13,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    const animationDrop = google.maps.Animation.DROP;

    let marker,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker,
        activeFilter = 'all',
        animationMarkerInterval,
        searchValue,
        statusOfAppIsSearch = true; // Direction or search

    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            id: 0,
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             },
            schedule: '00:00–00:00',
            type: 'clinic',
            address: '1, вул. Кутузова, Киев, 02000',
            lat: 50.418861,
            lng: 30.526437,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 1,
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '2, вул. Кутузова, Киев, 02000',
            lat: 50.428157,
            lng: 30.527383,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 2,
            title: 'Doctor',
            position: {lat: 50.424270, lng: 30.516910},
            icon: {
                url: doctorIcon,
                scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'doctor',
            name: 'Иванов иван иванович',
            address: '3, вул. Кутузова, Киев, 02000',
            lat: 50.424270,
            lng: 30.516910,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 3,
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.441555,
            lng: 30.527385,
            dutyClinic: true,
            aussendienst: true,
        },
        {
            id: 4,
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424160,
            lng: 30.481633,
            dutyClinic: false,
            aussendienst: false,
        },
        {
            id: 5,
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.445192,
            lng: 30.516832,
            dutyClinic: false,
            aussendienst: false,
        },
    ];

    const defaultLocations = locations;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    filterToggleBtn.addEventListener('click', function () {
        filterWrap.classList.toggle('filter--hide');
        document.querySelectorAll('.filter__toggle__inner')[0].classList.toggle('show');
        document.querySelectorAll('.filter__toggle__inner')[1].classList.toggle('hidden');
    });

    filterToggleListBtn.addEventListener('click', function () {
        filterParams.classList.toggle('show');
    });

    filterParamsClose.addEventListener('click', function () {
        filterParams.classList.remove('show');
    });


    function autocompliteFunc() {
        let autocomplete;

        autocomplete = new google.maps.places.Autocomplete(directionFromField);

        autocomplete.bindTo('bounds', map);

        let directionMarker = new google.maps.Marker({
            map: map,
            icon: {
                url: directionFromIcon,
                scaledSize: new google.maps.Size(35, 35)
            },
            anchorPoint: new google.maps.Point(0, -29)
        });

        autocomplete.addListener('place_changed', function() {
            directionMarker.setVisible(false);

            let place = autocomplete.getPlace();

            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            directionMarker.setPosition(place.geometry.location);
            directionMarker.setVisible(true);

        });

    }autocompliteFunc();


    function direction(){

        const directionLink = document.getElementsByClassName('js-direction');
        const directionLinksArr = [].slice.call(directionLink) || null;

        let linkAddress;

        if(directionLinksArr){

            directionLinksArr.forEach(function (item, i) {

                item.addEventListener('click', function (e) {

                    e.preventDefault();

                    filterParamsWrap.classList.add('hidden');
                    filterBlock[0].classList.add('hidden');
                    filterBlock[1].classList.remove('hidden');

                    linkAddress = item.getAttribute('data-direction');

                    directionToField.value = linkAddress;


                });

            });
        }

    }

    function showMore() {
        const showMore = document.getElementsByClassName('js-more');

        let markerId,
            marker;

        [].slice.call(showMore).forEach(function (item) {

            item.addEventListener('click', function () {
                console.log('click');
                markerId = item.getAttribute('data-marker-id');

                marker = allMarkers.filter(item => item.id == markerId)[0];

                console.log('showMore() -> marker:', marker);

                renderPopUp(marker);
            });
        });

    }

    function setMarkers(locations, animation){

        if(allMarkers){
            removeMarkers();
        }

        locations.forEach( function( element, i ) {

            marker = new google.maps.Marker({
                position: element.position,
                map: map,
                animation: animation,
                title: element.title,
                icon: element.icon,
                type: element.type,
                schedule: element.schedule,
                address: element.address,
                lat: element.lat,
                lng: element.lng,
                id: element.id,
                name: element.name || null,
                //animation: google.maps.Animation.BOUNCE,
            });

            allMarkers.push(marker);

            //console.log('setMarkers() -> allMarkers', allMarkers);

            allMarkers.forEach(function (item) {

                item.addListener('click', function() {

                    renderPopUp(item);

                    item.setAnimation(null);

                });

            });

        });

        //renderList(allMarkers); // renders list of markers
    }

    setMarkers(locations, animationDrop); // first init of markers

    function removeMarkers(){

        for(let i = 0; i < allMarkers.length ; i++){
            allMarkers[i].setMap(null);
        }

        allMarkers = [];
    }
    
    function renderPopUp(item) {

        if(popUpIsActive){
            popUpIsActive.close();
        }

        const {title, type} = item; // item data

        let infoWindowContent = `
            <div class="popUp">
                <h3>${title}</h3>
                <p>Адрес</p>
                <p>Медпрофиль контакта или компании</p>
                <p>Сотрудничество</p>
                <p>Wochenende ( компания и контакт)</p>
                <p>Wochenende ( компания и контакт)</p>
                <p>Ausendienst ( только для контактов)</p>
                <p>Статус компании или контакта</p>
                <p>Телефон раб</p>
                <p>Факс</p>
                <p>Мобильный (под вопросом)</p>
                ${type == 'doctor' ? '<p>Пол (муж или жен)</p>' : ''}
            </div>
                
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infoWindow.open(map, item);

        popUpIsActive = infoWindow;

    }

    function renderList(markersList){

        //console.log('allMarkers: ', allMarkers);

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = markersList.length;

        let newReultItem,
            type;

        resultList.innerHTML = ''; // Clear list

        if(allMarkersLength){
            for(let i = 0; i < allMarkersLength; i++){

                type = markersList[i].type == 'clinic' ? 'Больница' : 'Врач';

                newReultItem = document.createElement('li');
                newReultItem.classList.add('filter__result__item');
                newReultItem.innerHTML = `
                <h3 class="title">
                    <a 
                        href="#" 
                        class="to-center-link js-to-center-link" 
                        data-lat="${markersList[i].lat}" 
                        data-lng="${markersList[i].lng}"
                        data-marker-id="${markersList[i].id}"
                    >
                        ${markersList[i].title}
                    </a>
                </h3>
                <p class="info">Открыто:&nbsp;<span class="value">${markersList[i].schedule}</span>,&nbsp; <span class="type hospital">${type}</span></p>
                <p class="address">${markersList[i].address}</p>
                <div class="bottom">
                    <a href="#" class="direction js-direction" data-direction="${markersList[i].address}">Проложить маршрут</a>
                    <a href="#" class="more js-more" data-marker-id="${markersList[i].id}">Подробнее</a>
                </div>
            `;

                resultListFragment.appendChild(newReultItem);
            }

            resultList.appendChild(resultListFragment);

            direction(); // if exist results, we can create direction;

            showMore(); // if exist results, we can show infoWindow;

        }else{
            //resultList.innerHTML = '<li class="filter__result__item">not found</li>';
            resultList.innerHTML = 'not found';
        }


    }

    search(allMarkers); // as fix

    function linkToCenterItem(map){

        const resultItemsLinks = document.getElementsByClassName('js-to-center-link');
        const resultItemsArr = [].slice.call(resultItemsLinks);

        let lat,
            lng,
            id;
        let center;

        document.addEventListener('click', function (e) {
            const target = e.target;

            if(target.classList.contains('js-to-center-link')){
                setActiveMarker(target);
            }
        });

        function setActiveMarker($this) {

            if(activeMarker){
                clearInterval(animationMarkerInterval);
                activeMarker.setAnimation(null);
            }

            lat = $this.getAttribute('data-lat');
            lng = $this.getAttribute('data-lng');
            id = $this.getAttribute('data-marker-id');

            center = new google.maps.LatLng(lat, lng);
            map.panTo(center);

            let i = 0;

            //console.log('setActiveMarker() -> $this', $this);

            animationMarkerInterval = setInterval(function () {
                i++;

                for(let i = 0; i < allMarkers.length; i++){
                    if(allMarkers[i].id == id){
                        allMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
                        activeMarker = allMarkers[i];
                    }
                }
                if(i === 10){
                    clearInterval(animationMarkerInterval);
                }
            }, 150);


        }

    }

    linkToCenterItem(map);

    function search(allMarkers) {

        const markersList = allMarkers;

        //console.log('search() -> searchValue: ', searchValue);

        searchValue = searField.value.toLowerCase();

        let newMarkersList = [];

        if(searchValue){

            //console.log('searchValue: ', searchValue);

            markersList.forEach(function(item) {
                let {address, title, name} = item;

                address = address.toLowerCase();
                title = title.toLowerCase();
                name = name ? name.toLowerCase() : null;

                if( address.match(searchValue) ||
                    title.match(searchValue) ||
                    (name && name.match(searchValue))
                ){
                    newMarkersList.push(item);
                }
            });

        }else{
            newMarkersList = allMarkers;
        }
        renderList(newMarkersList);

    }

    searchField.addEventListener('keyup', function () {
        search(allMarkers);
    });

    searchClear.addEventListener('click', function () {
        searchField.value = null;
        search(allMarkers);
    });

    filterParamsWrap.addEventListener('click', function (e) {
        const target = e.target;

        if(target.classList.contains('js-all')){
            filter('all');
        }else if(target.classList.contains('js-clinics')){
            filter('clinic');
        }else if(target.classList.contains('js-doctors')){
            filter('doctor');
        }else if(target.classList.contains('js-duty-Clinic')){
            filter('dutyClinic');
        }else if(target.classList.contains('js-aussendienst')){
            filter('aussendienst');
        }
    });

    function filter(type) {

        let locFilterArr = [];

        if(type == 'all'){
            locFilterArr = locations;
        }else if(type == 'clinic' || type == 'doctor'){
            locFilterArr = locations.filter(item => item.type === type);
        }else if(type == 'dutyClinic'){
            locFilterArr = locations.filter(item => item.dutyClinic);
        }else if(type == 'aussendienst'){
            locFilterArr = locations.filter(item => item.aussendienst);
        }

        if(activeFilter !== type){
            removeMarkers();
            setMarkers(locFilterArr, animationDrop);
            search(locFilterArr);

            activeFilter = type;
        }

    }

}