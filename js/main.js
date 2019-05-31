
////////////////////////////////////////////////////////////////////////////////
function initMap() {

    // Search
    const searhField = document.getElementById('searchField');
    const searhFields = document.getElementsByClassName('search-field');
    const searchFindBtn = document.getElementById('searchFind');

    // Filter
    const filterWrap = document.getElementById('filter');
    const filterRadius= document.getElementById('radius');
    const filterParamsSelect = document.getElementsByClassName('filter__params__select')[0];
    const closeFilterMobBtn = document.getElementsByClassName('js-close-filter')[0];
    const clearFieldBtn = document.getElementsByClassName('js-clear'); // all clear btns
    const clearFieldBtnsArr = [].slice.call(clearFieldBtn);
    const filterResultItem = document.getElementsByClassName('filter__result__item'); // all results
    const filterBlock = document.getElementsByClassName('filter__header__inner'); // Search or Direction
    const filterAdditional = document.getElementsByClassName('js-filter-additional');
    const filterParamsClose = document.getElementsByClassName('js-filter-params-close');
    const filterParamsBasicBtn = document.getElementsByClassName('js-btn'); // All or Clinic or Doctor
    const filterToggleBtn = document.getElementsByClassName('filter__toggle')[0]; // Toggle filter
    const filterParamsWrap = document.getElementsByClassName('js-filter-params-wrap')[0];
    //const filterToggleListBtn = document.getElementsByClassName('js-toggle-filters-list')[0]; // Toggle additional filter

    // Direction
    const publicTransportBtn = document.getElementsByClassName('js-public-transport')[0];
    const backToSearchBtn = document.getElementsByClassName('js-to-searching')[0];
    const getDirectionsBtn = document.getElementsByClassName('js-get-directions')[0];
    const directionFromField = document.getElementById('directionFrom');
    const directionToField = document.getElementById('directionTo');
    const directionFields = document.getElementsByClassName('direction-field'); // both fields
    const travelTypeBtn = document.getElementsByClassName('js-travel-type-btn'); // both walk & car
    const directionFieldsWrap = document.getElementsByClassName('direction__menu')[0]; // fields wrap

    // Google map
    const defaultZoom = 11;
    const geocoder = new google.maps.Geocoder();
    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer;
    const hospitalIcon = "./img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    //const hospitalIconWidthScaledSize = 31;
    //const hospitalIconHeightScaledSize = 38.8;
    const doctorIcon = "./img/doctor.png";
    const doctorIconWidth = 26;
    const doctorIconHeight = 33.8;
    const directionFromIcon = "./img/directionFromIcon.png";
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: defaultZoom,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    const animationDrop = google.maps.Animation.DROP;
    const animationBounce= google.maps.Animation.BOUNCE;

    const ITERATION_SELECT_NUM = 8;

    let industry_ARR = [];
    let marker,
        RADIUS = 10000,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker,
        activeFilterBtn,
        activeFilter = 'all',
        TRAVEL_TYPE = 'DRIVING',
        SEARCH_VALUE = searhField.value || null,
        ACTIVE_RESULT_ITEM_ID = null,
        APP_STATUS = 0; //  0 - search | 1 - direction

    let clientMarker,
        FILTER_PARAMS = {},
        clientMarkerRadius;

    const map = new google.maps.Map(document.getElementById('map'), options);
    let LOCATIONS = [
        {
            id: 0,
            title: 'Clinic',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '00:00–00:00',
            type: 'clinic',
            address: 'Kovpaka St, 3, Kyiv, 02000',
            //lat: 50.418861,
            //lng: 30.526437,
            dutyClinic: true,
            aussendienst: false,
            industry: 'Notfallpraxis',
            cooperation: 'В процессе договорённости',
        },
        {
            id: 1,
            title: 'Clinic 1',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '2, Henerala Almazova St, Kyiv, 02000',
            //lat: 50.428157,
            //lng: 30.527383,
            dutyClinic: true,
            aussendienst: false,
            industry: 'Bereitsschaftdienst',
            cooperation: 'Сотрудничаем',
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
            address: '3, Henerala Almazova St, Kyiv, 02000',
            //lat: 50.424270,
            //lng: 30.516910,
            dutyClinic: true,
            aussendienst: false,
            industry: 'krankenwahgentransport',
        },
        {
            id: 3,
            title: 'Clinic 2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, Henerala Almazova St, Kyiv, 02000',
            //lat: 50.441555,
            //lng: 30.527385,
            dutyClinic: true,
            aussendienst: true,
            industry: 'privatärztlichenotdienst',
        },
    ];

    const dataURL = '/map/feed/map_feed.json';
    const BxCompanyURL = 'https://test.portal.mediciplus.de/crm/company/details/';
    const defaultLocations = LOCATIONS;

    const jqStylerConfig = {
        onSelectClosed: function() {

            const $this = $(this);

            if(!$this.hasClass('radius__select')){
                getAddParams($(this));
            }

        }
    };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Custom
    function custom(){

        $('.radius__select').styler();

        document.body.addEventListener('click', function(e){

            const target = e.target;
            const multiSelect = document.querySelectorAll('.jq-select-multiple');
            const wrap = e.target.parentNode.parentNode;

            if(
                wrap.classList.contains('jq-select-multiple') ||
                target.closest('.jq-select-multiple')
            ){
                wrap.classList.add('show');

                if(target.nodeName == 'LI'){

                    let arr = [];
                    const selected = target.closest('ul').querySelectorAll('li.selected');

                    for(let i = 0; i < selected.length; i++){
                        //console.log('selected[i]: ', selected[i].innerHTML);
                        arr.push(selected[i].innerHTML);
                    }

                    getAddParams('industry', arr);

                }

            }else{
                [].slice.call(multiSelect).forEach(function(item){
                    item.classList.remove('show');
                });

            }

        });

        function getData(){

            fetch(dataURL)
                .then(response => {
                    if(response.status == 200){
                        return response.json();
                    }
                })
                .then(function(data) {

                    console.log('getData() -> data: ', data);
                    if(data){
                        data.forEach(function(item, i){

                            let lat,
                                lng,
                                type,
                                icon,
                                position;

                            if(!item.TYPE){
                                item.TYPE = 'clinic';

                            }

                            if(item.TYPE == 'clinic'){
                                item.ICON = {
                                    url: hospitalIcon,
                                    scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
                                };

                            }else{
                                item.ICON = {
                                    url: doctorIcon,
                                    scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight)
                                };
                            }

                            item.LAT = item.LAT || 0;
                            item.LNG = item.LNG || 0;

                            lat = item.LAT;
                            lng = item.LNG;

                            item.POSITION = {lat: lat, lng: lng};

                            item.SCHEDULE = item.SCHEDULE || null;
                            item.STATUS = item.STATUS || null;
                            //em.PHONE_FAX = item.PHONE_FAX || null;
                            //em.PHONE_MOBILE = item.PHONE_MOBILE || null;
                            //em.PHONE_WORK = item.PHONE_WORK || null;
                            //em.WOCHENENDE = item.WOCHENENDE || null;
                            //em.COOPERATION = item.COOPERATION || null;
                            //em.MED_PROFILE = item.MED_PROFILE || null;

                        });

                        LOCATIONS = data;

                        //console.log('getData() -> LOCATIONS: ', LOCATIONS);

                        setMarkers(LOCATIONS, animationDrop); // first init of markers
                    }

                });

        }getData();

    }custom();

//////////////////////////////////////////////////////////////////////////////////////////

// Битрикс24

    BX24.fitWindow(); // Resize frame

    BX24.callMethod(
        "crm.company.userfield.list",
        {
            order: { "SORT": "ASC" }
        },
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else
            {
                //console.log(`crm.company.userfield.list : `, result.data());

                return result;
            }
        }
    );

    const getFieldsIndustry = function(){
        BX24.callMethod(
            "crm.status.list",
            {
                order: { "SORT": "ASC" },
                filter: {
                    "ENTITY_ID": 'INDUSTRY'
                }
            },
            function(result){
                if(result.error()){
                    console.error(result.error());
                }else{
                    result = result.data();

                    let newArr = [];
                    let obj = {};
                    result = result.forEach(function(item){
                        newArr.push(item.NAME);
                    });

                    result = {
                        'FIELD_NAME' : 'industry',
                        'LIST' : newArr,
                    };

                    //console.log(`result : `, result);
                    setOptions(result);
                }
            }
        );
    };

    const getCompanyUserfieldValues = function(FIELD_NAME){

        let valuesList;

        BX24.callMethod(
            "crm.company.userfield.list",
            {
                order: { "SORT": "ASC" },
                filter: { "FIELD_NAME": FIELD_NAME }
            },
            function(result){
                if(result.error()){
                    console.error(result.error());

                }else{
                    let name;

                    if(FIELD_NAME == 'UF_CRM_1438258999'){
                        FIELD_NAME = 'cooperation';
                    }else if(FIELD_NAME == 'UF_CRM_1387031615'){
                        FIELD_NAME = 'profile';
                    }else if(FIELD_NAME == 'UF_CRM_1402932716'){
                        FIELD_NAME = 'country';
                    }

                    result = {
                        'FIELD_NAME' : FIELD_NAME,
                        'LIST' : result.data()[0].LIST,
                    };

                    setOptions(result);
                    //return result;
                }
            }
        );
    };

    const industry = getFieldsIndustry('industry'); // Сфера деятельности
    const COOPERATIONS = getCompanyUserfieldValues('UF_CRM_1438258999'); //Cooperation
    const PROFILES = getCompanyUserfieldValues("UF_CRM_1387031615"); // Мед. Профиль Компании
    const COUNTRIES = getCompanyUserfieldValues("UF_CRM_1402932716"); // country

    let iteration = 0;

    function setOptions(item){

        const name = item.FIELD_NAME;
        const list = item.LIST;

        if(list){
            const countrtSelect = document.querySelectorAll('select.country');
            const cooperationSelect = document.querySelectorAll('select.cooperation');
            const profileSelect = document.querySelectorAll('select.profile');
            const industrySelect = document.querySelectorAll('select.industry');

            let itemValue;
            const fragment = document.createDocumentFragment();

            function mapping(node){

                //console.log('node.length', node.length);


                for(let i = 0; i < node.length; i++){

                    list.forEach(function(item){
                        let newOption = document.createElement('option');

                        if(name == 'industry'){
                            itemValue = item;

                        }else{
                            itemValue = item.VALUE;
                        }

                        newOption.innerHTML = itemValue;
                        newOption.value = itemValue;
                        fragment.appendChild(newOption);

                    });

                    node[i].appendChild(fragment);
                    iteration++;
                }

                if(iteration == ITERATION_SELECT_NUM){
                    $('.filter__select').styler(jqStylerConfig);
                }
            }

            if(name == 'country'){
                mapping(countrtSelect);
            }else if(name == 'cooperation'){
                mapping(cooperationSelect);
            }else if(name == 'profile'){
                mapping(profileSelect);
            }else if(name == 'industry'){
                mapping(industrySelect);
            }

        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Map init

    if(SEARCH_VALUE){
        searchField.value = SEARCH_VALUE;

        geocodeAddress(geocoder, map);
    }

    closeFilterMobBtn.addEventListener('click', function () {
        filterWrap.classList.toggle('filter--hide');
        this.classList.toggle('revert');
    });

    filterToggleBtn.addEventListener('click', function () {
        filterWrap.classList.toggle('filter--hide');
        document.querySelectorAll('.filter__toggle__inner')[0].classList.toggle('show');
        document.querySelectorAll('.filter__toggle__inner')[1].classList.toggle('hidden');
    });

    publicTransportBtn.addEventListener('click', function (e) {
        //e.preventDefault();

        let from = SEARCH_VALUE;
        let to = directionToField.value;
        from = from.replace(/ /gi, '+');
        to = to.replace(/ /gi, '+');

        e.target.href=`//google.ru/maps/dir/?api=1&origin=${from}&destination=${to}&travelmode=DRIVING`;

        this.click();
    });

    document.body.addEventListener('click', function (e) {
        const target = e.target;

        let filterAdditionalShow = document.querySelector(`.js-filter-additional.show`) || null;

        if(
            !target.classList.contains('js-btn') &&
            !target.parentNode.classList.contains('js-btn') &&
            !target.classList.contains('js-filter-additional') &&
            !target.closest('.js-filter-additional')
        ){
            if(filterAdditionalShow){
                filterAdditionalShow.classList.remove('show');
            }
            //document.querySelector(`.js-btn.active`).classList.remove('active');
            activeFilterBtn = null;
        }
    });

    [].slice.call(filterParamsBasicBtn).forEach(function (item) {
        item.addEventListener('click', function () {

            let additionalWrapCurrent;
            let itemType = item.getAttribute('data-type');
            let btnActive = document.querySelector('.js-btn.active');

            if(btnActive){
                btnActive.classList.remove('active');
            }

            item.classList.add('active');

            [].slice.call(filterAdditional).forEach(function (additionalWrap) {

                additionalWrap.classList.remove('show');

            });

            additionalWrapCurrent = document.querySelector(`.js-filter-additional[data-type=${itemType}]`) || null;

            if(itemType != btnActive.getAttribute('data-type')){
                filter(itemType, null);
            }

            if(itemType != activeFilterBtn && itemType != 'all'){

                if(additionalWrapCurrent){
                    additionalWrapCurrent.classList.add('show');
                }

                activeFilterBtn = itemType;

            }else{
                activeFilterBtn = null;
            }


        });
    });

    [].slice.call(filterParamsClose).forEach(function (item) {

        item.addEventListener('click', function () {
            document.querySelector(`.js-filter-additional.show`).classList.remove('show');
            activeFilterBtn = null;
        });
    });


    function directionFieldsError() {

        if(!directionFromField.value){

            directionFromField.classList.add('error');

        }else{
            let directionFieldError = document.querySelector('.direction-field.error') || null;

            if(directionFieldError){
                directionFieldError.classList.remove('error');
            }
        }
    }

    directionFromField.addEventListener('keyup', function () {
        directionFieldsError();
    });


    document.body.addEventListener('click', function(e){
        const target = e.target;

        let num;

        if(target.nodeName == 'LI' && target.classList.contains('radius__value')){

            num = target.innerHTML + '000';
            num = +num.replace(/ km/gi, '');
            //console.log('this: ', num);
            RADIUS = num;
            geocodeAddress(geocoder, map, RADIUS);
        }

    });


    function geocodeAddress() {

        let address = SEARCH_VALUE;

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {

                if(clientMarker){
                    clientMarker.setVisible(false);
                    clientMarkerRadius.setMap(null);
                }

                map.setCenter(results[0].geometry.location);

                clientMarker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });

                clientMarkerRadius = new google.maps.Circle({
                    strokeColor: '#00B1DA',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    fillColor: '#00B1DA',
                    fillOpacity: 0.20,
                    map: map,
                    center: results[0].geometry.location,
                    radius: RADIUS // in meters
                });

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function autocompliteFunc() {
        let autocomplete;

        [].slice.call(searhFields).forEach(function (item) {

            autocomplete = new google.maps.places.Autocomplete(item);

            autocomplete.bindTo('bounds', map);

            let directionMarker = new google.maps.Marker({
                map: map,
                icon: {
                    url: directionFromIcon,
                    scaledSize: new google.maps.Size(35, 35)
                },
                anchorPoint: new google.maps.Point(0, -29)
            });

            item.addEventListener('keyup', function () {
                SEARCH_VALUE = this.value;
            });

            autocomplete.addListener('place_changed', function() {

                directionMarker.setVisible(false);

                let place = autocomplete.getPlace();

                SEARCH_VALUE = item.value || null;

                directionMarker.setVisible(true);

                geocodeAddress(geocoder, map);
            });

        });

    }autocompliteFunc();

    function direction(){
        const directionLink = document.getElementsByClassName('js-direction');
        const directionLinksArr = [].slice.call(directionLink) || null;

        let linkAddress,
            directionsInfoWrap,
            itemId,
            itemWrap;
        let duration = document.querySelectorAll('.js-duration');
        let distance = document.querySelectorAll('.js-distance');
        let durationsArr = [].slice.call(duration);
        let distanceArr = [].slice.call(distance);

        if(directionLinksArr){

            directionsDisplay.setMap(map);

            directionLinksArr.forEach(function (item, i) {

                item.addEventListener('click', function (e) {
                    e.preventDefault();

                    // if Searching (== 0)
                    if(APP_STATUS == 0){

                        filterParamsWrap.classList.add('hidden');
                        filterBlock[0].classList.add('hidden');
                        filterBlock[1].classList.remove('hidden');
                        directionFieldsWrap.classList.add('show');

                        APP_STATUS = 1;
                    }

                    itemWrap = item.closest('.filter__result__item');
                    itemId = itemWrap.getAttribute('data-item-id');
                    linkAddress = item.getAttribute('data-direction');

                    directionFromField.value = SEARCH_VALUE;
                    directionToField.value = linkAddress;

                    itemWrap.classList.add('active');

                    directionFieldsError();

                    if(itemId !== ACTIVE_RESULT_ITEM_ID){

                        durationsArr.forEach(function (item) {
                            item.innerHTML = '';
                        });

                        distanceArr.forEach(function (item) {
                            item.innerHTML = '';
                        });

                        setActiveResultItem(itemId);

                        getDirections();
                    }

                    toggleStateOfResultItems(itemId);

                });
            });
        }
    }

    [].slice.call(travelTypeBtn).forEach(function (item) {

        item.addEventListener('click', function (btn) {

            document.querySelector('.js-travel-type-btn.active').classList.remove('active');

            TRAVEL_TYPE = item.getAttribute('data-type');
            this.classList.add('active');

            getDirections(TRAVEL_TYPE);

        });
    });

    // Hide directions fields && show
    backToSearchBtn.addEventListener('click', function () {
        filterParamsWrap.classList.remove('hidden');
        filterBlock[0].classList.remove('hidden');
        filterBlock[1].classList.add('hidden');
        directionFieldsWrap.classList.remove('show');

        document.querySelector('.filter__result__item.active').classList.remove('active');

        APP_STATUS = 0; // search

        searhField.value = SEARCH_VALUE ? SEARCH_VALUE : null; // value from direction field

        toggleStateOfResultItems();
    });

    function getDirections(travelType){

        TRAVEL_TYPE = travelType ? travelType : TRAVEL_TYPE;

        let itemWrap = document.querySelector('.filter__result__item.active') || null;

        // value from direction field
        directionFromField.value = SEARCH_VALUE ? SEARCH_VALUE : null;

        if(directionFromField.value){
            directionsService.route({
                origin: directionFromField.value, // from
                destination: directionToField.value, // to
                travelMode: TRAVEL_TYPE // type
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);

                    let point = response.routes[0].legs[0];

                    itemWrap.querySelector('.js-duration').innerHTML = `Duration:&nbsp;<span class="value">${point.duration.text}</span>`;
                    itemWrap.querySelector('.js-distance').innerHTML = `Distance:&nbsp;<span class="value">${point.distance.text}</span>`;

                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }

    }

    function setActiveResultItem(itemId) {

        const filterResultItemsArr = [].slice.call(filterResultItem);

        filterResultItemsArr.forEach(function (item) {
            item.classList.remove('active');
        });

        const activeItem = filterResultItemsArr.filter(item => item.getAttribute('data-item-id') == itemId)[0];

        activeItem.classList.add('active');

        activeItem.scrollIntoView({block: "end", behavior: "smooth"});

        ACTIVE_RESULT_ITEM_ID = itemId;

    }

    function toggleStateOfResultItems(itemId){

        const filterResultItemsArr = [].slice.call(filterResultItem);

        if(APP_STATUS == 1){
            filterResultItemsArr.filter(item => item.getAttribute('data-item-id') != itemId).forEach(function (item) {
                item.classList.add('hide');
            });
        }else{
            filterResultItemsArr.filter(item => item.getAttribute('data-item-id') != itemId).forEach(function (item) {
                item.classList.remove('hide');
            });
        }
    }

    function showDetails() {
        const showDetails = document.getElementsByClassName('js-more');

        let markerId,
            marker;

        [].slice.call(showDetails).forEach(function (item) {

            item.addEventListener('click', function () {
                markerId = item.getAttribute('data-marker-id');

                marker = allMarkers.filter(item => item.id == markerId)[0];

                setActiveResultItem(markerId);

                renderPopUp(marker);
            });
        });
    }

    function setMarkers(LOCATIONS, animation){

        if(allMarkers){
            removeMarkers();
        }

        //console.log('setMarkers() -> LOCATIONS: ', LOCATIONS);

        LOCATIONS.forEach( function( element, i ) {

            marker = new google.maps.Marker({
                map: map,
                animation: animation,
                id: element.ID,
                position: element.POSITION,
                title: element.TITLE,
                icon: element.ICON,
                type: element.TYPE,
                schedule: element.SCHEDULE,
                address: element.ADDRESS,
                lat: element.LAT,
                lng: element.LNG,
                status: element.STATUS,
                med_profile: element.MED_PROFILE,
                industry: element.INDUSTRY,
                wochenede: element.WOCHENENDE,
                cooperation: element.COOPERATION,
                phone_fax: element.PHONE_FAX,
                phone_mobile: element.PHONE_MOBILE,
                phone_work: element.PHONE_WORK,
                name: element.NAME || null,
            });

            allMarkers.push(marker);

            allMarkers.forEach(function (item) {

                item.addListener('click', function() {

                    renderPopUp(item);

                    item.setAnimation(null);

                    setActiveResultItem(item.id);

                });

            });

        });
        renderList(allMarkers); // renders list of markers
    }

    setMarkers(LOCATIONS, animationDrop); // first init of markers

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

        let {title, type, address, schedule, id, phone_work, phone_fax, phone_mobile, cooperation, status, sex, med_profile, wochenende, ausendienst} = item; // item data
        let med_profiles = '';
        let profile;

        if(med_profile){

            for(let i = 0; i < med_profile.length; i++){

                if(i != (med_profile.length - 1)){
                    profile = med_profile[i] + ',&nbsp;';

                }else{
                    profile = med_profile[i];

                }

                med_profiles += profile;
            }

        }else{
            med_profile = null;

        }

        let infoWindowContent = `
          <div class="popUp">
              <h3 style="font-weight: 700;">${title}&nbsp;<a href="${BxCompanyURL}${id}/" target="_blank">Open</a></h3>
              <p>Addess:&nbsp;${address}</p>
              ${med_profile ? '<p>Медпрофиль:&nbsp;' + med_profiles + '</p>' : ''}
              ${cooperation ? '<p>Cooperation:&nbsp;' + cooperation + '</p>' : ''}
              ${wochenende != null ? '<p>Wochenende:&nbsp;' + wochenende + '</p>' : ''}
              ${ausendienst != null ? '<p>Ausendienst:&nbsp;' + ausendienst + '</p>' : ''}
              ${status != null ? '<p>Status:&nbsp;' + status + '</p>' : ''}
              ${phone_work ? '<p>Work:&nbsp;<a href="tel:' + phone_work + '">' + phone_work + '</a></p>' : ''}
              ${phone_fax ? '<p>Fax:&nbsp;' + phone_fax + '</p>' : ''}
              ${phone_mobile ? '<p>Mobile:&nbsp;<a href="tel:' + phone_mobile + '">' + phone_mobile + '</a></p>' : ''}
              ${type == 'doctor' && sex ? '<p>Пол (муж или жен)</p>' : ''}
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infoWindow.open(map, item);

        popUpIsActive = infoWindow;
    }

    function renderList(markersList){

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = markersList.length;

        let newReultItem,
            type;

        resultList.innerHTML = ''; // Clear list

        //console.log('renderList(markersList): ', markersList);

        if(allMarkersLength){
            for(let i = 0; i < allMarkersLength; i++){

                type = markersList[i].type == 'clinic' ? 'Clinic' : 'Doctor';

                newReultItem = document.createElement('li');
                newReultItem.classList.add('filter__result__item');
                newReultItem.setAttribute('data-item-id', markersList[i].id);

                if(markersList[i].id == ACTIVE_RESULT_ITEM_ID){
                    newReultItem.classList.add('active');
                }

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
                  <p class="info">${markersList[i].schedule ? 'Open:&nbsp;<span class="value">'  +markersList[i].schedule + '</span>,&nbsp;' : ''}<span class="type hospital">${type}</span></p>
                  <p class="address">${markersList[i].address}</p>
                  <div class="bottom">
                      <a href="#" class="direction js-direction" data-direction="${markersList[i].address}">Get direction</a>
                      <a href="#" class="more js-more" data-marker-id="${markersList[i].id}">Details</a>
                  </div>
                  <div class="directions-info js-directions-info">
                      <div class="js-duration"></div>
                      <div class="distance js-distance"></div>
                  </div>
               `;

                resultListFragment.appendChild(newReultItem);
            }

            resultList.appendChild(resultListFragment);

            direction(); // if exist results, we can create direction;
            showDetails(); // if exist results, we can show infoWindow;

        }else{
            //resultList.innerHTML = '<li class="filter__result__item">not found</li>';
            resultList.innerHTML = 'not found';
        }
    }

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
                activeMarker.setAnimation(null);
            }

            lat = $this.getAttribute('data-lat');
            lng = $this.getAttribute('data-lng');
            id = $this.getAttribute('data-marker-id');

            setActiveResultItem(id);

            center = new google.maps.LatLng(lat, lng);
            map.panTo(center);
            map.setZoom(16);

            for(let i = 0; i < allMarkers.length; i++){
                if(allMarkers[i].id == id){
                    //allMarkers[i].setAnimation(animationBounce);

                    activeMarker = allMarkers[i];
                }
            }
        }
    }

    linkToCenterItem(map);

    clearFieldBtnsArr.forEach(function (item) {
        item.addEventListener('click', function () {

            let field = this.parentNode.getElementsByClassName('field')[0];

            // fix re-render result list
            if(field.value){
                field.value = null;
                SEARCH_VALUE = null;
            }
        });
    });

    function getAddParams(item, value){

        const emptyValue = "&nbsp;";

        let paramName;

        if(value){

            if(value != emptyValue){
                FILTER_PARAMS[item] = value; // INDUSTRY

            }else{
                FILTER_PARAMS[item] = null;
            }

        }else{
            item = item[0];
            value = item.getElementsByClassName('jq-selectbox__select-text')[0].innerHTML;

            paramName = item.closest('li.filter__header__params__item').querySelector('[data-param]').getAttribute('data-param');

            if(value != emptyValue){
                FILTER_PARAMS[paramName] = value;

            }else{
                FILTER_PARAMS[paramName] = null;
            }
        }

        filter(FILTER_PARAMS.type, FILTER_PARAMS);

    }

    function filter(type, addParams) {

        let locFilterArr = LOCATIONS;
        let filterParamsKeys = [];
        let itemKey;

        if(!addParams){
            FILTER_PARAMS = {};
        }

        FILTER_PARAMS.type = type;

        //console.log('FILTER_PARAMS: ', FILTER_PARAMS);
        console.log('locFilterArr: ', locFilterArr);

        if(FILTER_PARAMS.type == 'all'){
            locFilterArr = LOCATIONS;

        }else if(FILTER_PARAMS.type == 'clinics' || FILTER_PARAMS.type == 'doctors'){

            filterParamsKeys = Object.keys(FILTER_PARAMS);

            type = FILTER_PARAMS.type == 'clinics' ? 'clinic' : 'doctor';

            filterParamsKeys.forEach(function(key){

                if(FILTER_PARAMS[key] != null ){

                    locFilterArr = locFilterArr.filter(item => {

                        itemKey = item[key.toUpperCase()];

                        if(key == 'type'){
                            return item.TYPE == type;

                        }else if(key == 'med_profile'){

                            if(itemKey && itemKey.indexOf(FILTER_PARAMS[key]) != -1){
                                return item;

                            }else{
                                return;

                            }


                        }else{
                            return itemKey == FILTER_PARAMS[key];
                        }

                    });
                }

            });

        }else if(FILTER_PARAMS.type == 'notdienst'){
            locFilterArr = LOCATIONS.filter(item =>
                item.INDUSTRY && (item.INDUSTRY.toLowerCase() == 'notfallpraxis' || item.INDUSTRY.toLowerCase() == 'bereitsschaftdienst') );

        }else if(FILTER_PARAMS.type == 'taxi'){
            locFilterArr = LOCATIONS.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 'taxi unternehmer' );

        }else if(FILTER_PARAMS.type == 'krankenwahgentransport'){
            locFilterArr = LOCATIONS.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 'krankenwahgentransport' );

        }else if(FILTER_PARAMS.type == 'privatärztlichenotdienst'){
            locFilterArr = LOCATIONS.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 'privatärztlichenotdienst' );
        }

        //if(activeFilter !== type){

        removeMarkers();
        setMarkers(locFilterArr, animationDrop);

        activeFilter = type;
        //}

    }

}