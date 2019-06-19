/*{
 "ID": "549",
 "TITLE": "",
 "SEX": "45",
 "ADDRESS": "ул. Айманова 68А Алматы Казахстан ",
 "LAT": 43.2469713,
 "LNG": 76.89651049999999,
 "TYPE_ID": "SUPPLIER",
 "INDUSTRY": "3",
 "MED_PROFILE": [
 141
 ],
 "COOPERATION": "1216",
 "STATUS_ID": [],
 "PHONE_WORK": "+49 211 35 23 22",
 "PHONE_FAX": "+49 211 935 77 70",
 "PHONE_MOBILE": null
 },*/
////////////////////////////////////////////////////////////////////////////////
function initMap() {

    // Search
    const searhField = document.getElementById('searchField');
    const searhFields = document.getElementsByClassName('search-field');
    const searchFindBtn = document.getElementById('searchFind');

    // Filter
    const filterWrap = document.getElementById('filter');
    const filterRadius = document.getElementById('radius');
    const filterResultCounter = document.querySelector('.filter__result__counter .value');
    const filterParamsSelect = document.getElementsByClassName('filter__params__select')[0];
    const closeFilterMobBtn = document.getElementsByClassName('js-close-filter')[0];
    const clearFieldBtn = document.getElementsByClassName('js-clear'); // all clear btns
    const clearFieldBtnsArr = [].slice.call(clearFieldBtn);
    const filterResultItem = document.getElementsByClassName('filter__result__item'); // all results
    const filterBlock = document.getElementsByClassName('filter__header__inner'); // Search or Direction
    const filterAdditional = document.getElementsByClassName('js-filter-additional');
    const filterParamsClose = document.getElementsByClassName('js-filter-params-close');
    const filterParamsBasicBtn = document.getElementsByClassName('js-btn'); // All or Clinic or praxis
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
    let directionsDisplay = new google.maps.DirectionsRenderer;
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

    const ITERATION_SELECT_NUM = 7;


    const SEX_LIST = [
        {ID: 45, VALUE: "Мужской"},
        {ID: 47, VALUE: "Женский"},
    ];

    let industry_ARR = [];
    let marker,
        RADIUS = 10000,
        allMarkers = [],
        POP_UP_IS_ACTIVE = null,
        activeMarker,
        activeFilterBtn,
        activeFilter = 'all',
        TRAVEL_TYPE = 'DRIVING',
        SEARCH_VALUE = searhField.value || null,
        ACTIVE_RESULT_ITEM_ID = null,
        APP_STATUS = 0, //  0 - search | 1 - direction
        INDUSTRY_LIST,
        MED_PROFILES_COMPANY_LIST,
        MED_PROFILES_CONTACT_LIST,
        COOPERATIONS_COMPANY_LIST,
        COOPERATIONS_CONTACT_LIST,
        COUNTRY_LIST,
        STATUSES_COMPANY_LIST,
        STATUSES_CONTACT_LIST,
        LANGUAGES_LIST;

    let clientMarker,
        FILTER_PARAMS = {
            type: 'All',
            radius: RADIUS
        },
        clientMarkerRadius,
        CLIENT_ADDRESS,
        CLIENT_LAT,
        CLIENT_LNG;
    let CLIENT_LOCATION;

    let LOCATIONS;

    const map = new google.maps.Map(document.getElementById('map'), options);
    const dataURL = '/map/feed/map_feed.json';
    const defaultLocations = LOCATIONS;

    const jqStylerConfig = {
        selectSmartPositioning: true,
        onSelectClosed: function() {

            const $this = $(this);
            if(!$this.hasClass('radius__select')){
                //getAddParams($(this));
            }

        }
    };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Custom
    function custom(){

        //$('.radius__select').styler();

        document.body.addEventListener('click', function(e){

            const target = e.target;
            const multiSelect = document.querySelectorAll('.select2-results__options[aria-multiselectable="true"]');
            const wrap = e.target.parentNode.parentNode;

            let isRemoveBtn = 0;

            if(
                (wrap && wrap.classList.contains('select2-results__options')) ||
                target.closest('.select2-results__options[aria-multiselectable="true"]') ||
                target.closest('.select2-selection__choice__remove') ||
                target.classList.contains('select2-selection__choice__remove')

            ){
                wrap && wrap.classList.add('show');

                if(target.classList.contains('select2-selection__choice__remove')){
                    isRemoveBtn = 1;
                }

                //console.log('click');

                if(target.nodeName == 'LI' || isRemoveBtn){
                    let data;
                    let arr = [];
                    const regExpId = /[0-9]*$/gm;
                    const selected = document.querySelectorAll('li[aria-selected="true"]');

                    //console.log('selected: ', selected);

                    for(let i = 0; i < selected.length; i++){
                        arr.push(+selected[i].getAttribute('data-select2-id').match(regExpId)[0]);
                    }

                    data = {
                        name: 'med_profile',
                        value: arr.length ? arr : null,
                    }

                    getAddParams(data);

                }

            }else{
                [].slice.call(multiSelect).forEach(function(item){
                    item.classList.remove('show');
                });

            }

        });

    }custom();

    function initSelect2(){

        const select = $('select.filter__select')

        select.select2({minimumResultsForSearch: -1});

        select.on('select2:select', function(e){

            if(e.target.getAttribute('data-param') != 'med_profile'){
                let data = e.params.data;
                data = {
                    name: e.target.getAttribute('data-param'),
                    value: data.id,
                    title: data.text,
                };

                getAddParams(data);
            }

        });

    }initSelect2();

    async function getClientLocation(){

        CLIENT_ADDRESS = searhField.value.replace(/ /gi, '+') || null;

        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${CLIENT_ADDRESS}&key=AIzaSyBeVoPDyYZyUq-h735KGeK4OA9-BEuecBg&libraries`);
        const data = await response.json();

        if(data.status == 'OK'){

            CLIENT_LAT = +data.results[0].geometry.location.lat;
            CLIENT_LNG = +data.results[0].geometry.location.lng;

            await getData();

        }else{
            console.log('getClientLocation() -> error: ', data);
        }

    }getClientLocation();

    function getData(){

        fetch(dataURL)
            .then(response => {
                if(response.status == 200){
                    return response.json();
                }
            })
            .then(function(data) {

                //console.log('getData() -> data: ', data);

                if(data){

                    CLIENT_ADDRESS = searhField.value || null;

                    data.forEach(function(item, i){

                        let lat,
                            lng,
                            type,
                            icon,
                            distance,
                            position;

                        if(item.INDUSTRY == 'NOTPROFIT' && !item.SEX){ // Клиника [Мед. Клиника]
                            item.TYPE = 'clinic';

                        }else if(item.INDUSTRY == '3' && !item.SEX){ // Доктор [Мед. Ассистанс]
                            item.TYPE = 'praxis';

                        }else if(item.SEX){
                            item.TYPE = 'doctor';

                        }else {
                            item.TYPE = 'undefined';
                        }

                        if(item.TYPE == 'clinic'){
                            item.ICON = {
                                url: hospitalIcon,
                                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight),
                            };

                        }else{
                            item.ICON = {
                                //url: doctorIcon,
                                //scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight),
                                path: "M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zM104 424c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24zm216-135.4v49c36.5 7.4 64 39.8 64 78.4v41.7c0 7.6-5.4 14.2-12.9 15.7l-32.2 6.4c-4.3.9-8.5-1.9-9.4-6.3l-3.1-15.7c-.9-4.3 1.9-8.6 6.3-9.4l19.3-3.9V416c0-62.8-96-65.1-96 1.9v26.7l19.3 3.9c4.3.9 7.1 5.1 6.3 9.4l-3.1 15.7c-.9 4.3-5.1 7.1-9.4 6.3l-31.2-4.2c-7.9-1.1-13.8-7.8-13.8-15.9V416c0-38.6 27.5-70.9 64-78.4v-45.2c-2.2.7-4.4 1.1-6.6 1.9-18 6.3-37.3 9.8-57.4 9.8s-39.4-3.5-57.4-9.8c-7.4-2.6-14.9-4.2-22.6-5.2v81.6c23.1 6.9 40 28.1 40 53.4 0 30.9-25.1 56-56 56s-56-25.1-56-56c0-25.3 16.9-46.5 40-53.4v-80.4C48.5 301 0 355.8 0 422.4v44.8C0 491.9 20.1 512 44.8 512h358.4c24.7 0 44.8-20.1 44.8-44.8v-44.8c0-72-56.8-130.3-128-133.8z",
                                anchor: new google.maps.Point(0,0),
                                fillColor: 'red',
                                fillOpacity: 1,
                                scale: .07
                            };
                        }

                        item.LAT = item.LAT || 0;
                        item.LNG = item.LNG || 0;

                        lat = item.LAT
                        lng = item.LNG;

                        item.POSITION = {lat: lat, lng: lng};

                        distance = getDistanceFromLatLonInKm(+CLIENT_LAT, +CLIENT_LNG, +lat, +lng);

                        item.SEX = item.SEX || null;
                        item.STATUS = item.STATUS || null;
                        item.SCHEDULE = item.SCHEDULE || null;
                        item.DISTANCE = Math.round(distance);

                    });

                    LOCATIONS = data;

                    console.log('getData() -> LOCATIONS: ', LOCATIONS);

                    filter(FILTER_PARAMS.type, FILTER_PARAMS);

                    //setMarkers(LOCATIONS, animationDrop); // first init of markers
                }

            });
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = deg2rad(lat2-lat1);  // deg2rad below
        let dLon = deg2rad(lon2-lon1);
        let a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c; // Distance in km

        //console.log(`lat1: ${lat1}, lon1: ${lon1}, lat2: ${lat2}, lon2: ${lon2}, `);

        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

//////////////////////////////////////////////////////////////////////////////////////////

// Битрикс24

    // Resize frame
    BX24.fitWindow();

    // Get company.userfield.list
    BX24.callMethod(
        "crm.company.userfield.list",
        {
            order: { "SORT": "ASC" }
        },
        function(result){

            if(result.error())
                console.error(result.error());
            else{

                //console.log(`crm.company.userfield.list: `, result.data());
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

                    result.forEach(function(item){
                        newArr.push({
                            ID: item.STATUS_ID,
                            VALUE: item.NAME
                        });
                    });

                    result = {
                        'FIELD_NAME' : 'industry',
                        'LIST' : newArr,
                    };


                    INDUSTRY_LIST = result.LIST;

                    //console.log(`result : `, result);

                    setOptions(result);
                }
            }
        );
    };

    BX24.callMethod(
        "crm.contact.company.fields",
        {},
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else{

                //console.log('crm.contact.company.fields: ', result.data());
            }
        }
    );


    BX24.callMethod(
        "crm.company.fields",
        {},
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else{
                //console.log('crm.company.fields:', result.data());
            }
        }
    );

    BX24.callMethod(
        "crm.contact.userfield.list",
        {
            order: { "SORT": "ASC" }
        },
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else
            {
                //console.log('crm.contact.userfield.list: ', result.data());
            }
        }
    );

    BX24.callMethod(
        "crm.contact.fields",
        {},
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else {
                //console.log('crm.contact.fields: ', result.data());
            }
        }
    );

    const getCompanyUserfieldValues = function(FIELD_NAME, type){

        let valuesList,
            listURL;

        listURL = type == 'company' ? "crm.company.userfield.list" : "crm.contact.userfield.list"

        BX24.callMethod(
            listURL,
            {
                order: { "SORT": "ASC" },
                filter: { "FIELD_NAME": FIELD_NAME }
            },
            function(result){
                if(result.error()){
                    console.error(result.error());

                }else{

                    //console.log(`result.data(): `, result.data()[0].LIST);

                    let name,
                        list = [];

                    result.data()[0].LIST.forEach(function(item){

                        list.push({
                            ID: item.ID,
                            VALUE: item.VALUE
                        });
                    });

                    if(FIELD_NAME == 'UF_CRM_1438258999'){
                        FIELD_NAME = 'cooperation';
                        COOPERATIONS_COMPANY_LIST = list;

                    }else if(FIELD_NAME == 'UF_CRM_1387031615'){
                        FIELD_NAME = 'profile';
                        MED_PROFILES_COMPANY_LIST = list;

                    }else if(FIELD_NAME == 'UF_CRM_1402932716'){
                        FIELD_NAME = 'country';
                        COUNTRY_LIST = list;

                    }else if(FIELD_NAME == 'UF_CRM_1415786182'){
                        FIELD_NAME = 'status_company';
                        STATUSES_COMPANY_LIST = list;

                    }else if(FIELD_NAME == 'UF_CRM_1433940616'){
                        FIELD_NAME = 'language';
                        //console.log('result: ', result);
                        LANGUAGES_LIST = list;

                    }else if(FIELD_NAME == 'UF_CRM_1553940316'){
                        FIELD_NAME = 'wochenede_company';

                    }else if(FIELD_NAME == 'UF_CRM_1388085826'){
                        FIELD_NAME = 'status_contact';
                        STATUSES_CONTACT_LIST = list;
                        //console.log('STATUSES_CONTACT_LIST: ', STATUSES_CONTACT_LIST);

                    }else if(FIELD_NAME == 'UF_CRM_1438259138'){
                        FIELD_NAME = 'cooperation_contact';
                        COOPERATIONS_CONTACT_LIST = list;
                        //console.log('COOPERATIONS_CONTACT_LIST: ', COOPERATIONS_CONTACT_LIST);

                    }else if(FIELD_NAME == 'UF_CRM_1387029485'){
                        FIELD_NAME = 'profile_contact';
                        MED_PROFILES_CONTACT_LIST = list;
                        //console.log('MED_PROFILES_CONTACT_LIST: ', MED_PROFILES_CONTACT_LIST);

                    }

                    result = {
                        FIELD_NAME : FIELD_NAME,
                        LIST : list
                    };

                    //console.log('result: ', result);

                    setOptions(result);
                    //return result;
                }
            }
        );
    };

    //UF_CRM_1387031615 -- Мед. Профиль (company)
    //UF_CRM_1425472914 -- Auserdinst (contact)
    //UF_CRM_1388085826 -- Status (contact) // crm.contact.userfield.list
    //UF_CRM_1553940264 -- wochenede (contact)
    //UF_CRM_1553940316 -- wochenede (company)

    const industry = getFieldsIndustry('industry'); // Сфера деятельности
    const COOPERATIONS = getCompanyUserfieldValues('UF_CRM_1438258999', 'company'); //Cooperation
    const COOPERATIONS_CONTACT = getCompanyUserfieldValues('UF_CRM_1438259138', 'contact'); //Cooperation (contact)
    const PROFILES = getCompanyUserfieldValues("UF_CRM_1387031615", 'company'); // Мед. Профиль Компании
    const PROFILES_CONTACT = getCompanyUserfieldValues("UF_CRM_1387029485", 'contact'); // Мед. Профиль (contact)
    const COUNTRIES = getCompanyUserfieldValues("UF_CRM_1402932716", 'company'); // country
    const STATUSES_COMPANY = getCompanyUserfieldValues("UF_CRM_1415786182", 'company'); // status (company)
    const STATUSES_CONTACT = getCompanyUserfieldValues("UF_CRM_1388085826", 'contact'); // status
    //const WOCHENEDE_COMPANY = getCompanyUserfieldValues("UF_CRM_1553940316", 'company'); // wochenede (company)
    const SPRACHE = getCompanyUserfieldValues("UF_CRM_1433940616", 'contact'); // sprache

    let iteration = 0;

    function setOptions(item){

        const name = item.FIELD_NAME;
        const list = item.LIST;

        if(list){
            const countrtSelect = document.querySelectorAll('select.country');
            const cooperationSelect = document.querySelectorAll('select.cooperation');
            const profileSelect = document.querySelectorAll('select.profile');
            const industrySelect = document.querySelectorAll('select.industry');
            const statusSelectContact = document.querySelectorAll('select#doctorStatus');
            const statusSelectCompany = document.querySelectorAll('select#clinicStatus');
            const languageSelect = document.querySelectorAll('select.sprache');

            let itemValue,
                itemId;
            const fragment = document.createDocumentFragment();

            function mapping(node){

                for(let i = 0; i < node.length; i++){

                    list.forEach(function(item){
                        let newOption = document.createElement('option');

                        itemValue = item.VALUE;
                        itemId = item.ID;

                        newOption.innerHTML = itemValue;
                        newOption.value = itemId;
                        newOption.setAttribute('data-value', itemId);
                        fragment.appendChild(newOption);

                    });

                    node[i].appendChild(fragment);
                    iteration++;
                }

                if(iteration == ITERATION_SELECT_NUM){
                    //$('.filter__select').styler(jqStylerConfig);
                    //initSelect2();
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
            }else if(name == 'status_company'){
                mapping(statusSelectCompany);
            }else if(name == 'language'){
                mapping(languageSelect);
            }else if(name == 'status_contact'){
                mapping(statusSelectContact);
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
            !target.closest('.js-filter-additional') &&
            !target.classList.contains('select2-results__options') &&
            !target.closest('.select2-results__options') &&
            !target.closest('.select2-selection__choice__remove')
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


            directionsDisplay.setMap(null);
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
                    map: RADIUS != 100000000000 ? map : null,
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

                getClientLocation();

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

                    // if Searching (APP_STATUS == 0)
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

                    //if(itemId !== ACTIVE_RESULT_ITEM_ID){

                    durationsArr.forEach(function (item) {
                        item.innerHTML = '';
                    });

                    distanceArr.forEach(function (item) {
                        item.innerHTML = '';
                    });

                    setActiveResultItem(itemId);

                    getDirections();
                    //}

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

        getDirections();

    });

    function getDirections(travelType){

        TRAVEL_TYPE = travelType ? travelType : TRAVEL_TYPE;

        let itemWrap = document.querySelector('.filter__result__item.active') || null;

        // value from direction field
        directionFromField.value = SEARCH_VALUE ? SEARCH_VALUE : null;

        if(APP_STATUS != 0 && directionFromField.value ){

            directionsService.route({
                origin: directionFromField.value, // from
                destination: directionToField.value, // to
                travelMode: TRAVEL_TYPE // type
            }, function(response, status) {
                if (status === 'OK') {

                    directionsDisplay.setMap(map);
                    directionsDisplay.setDirections(response);

                    let point = response.routes[0].legs[0];

                    itemWrap.querySelector('.js-duration').innerHTML = `Duration:&nbsp;<span class="value">${point.duration.text}</span>`;
                    itemWrap.querySelector('.js-distance').innerHTML = `Distance:&nbsp;<span class="value">${point.distance.text}</span>`;

                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }else{

            directionsDisplay.set('directions', null);
            //directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
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
                sex: element.SEX,
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



        });


        allMarkers.forEach(function (item) {

            item.addListener('click', function() {

                renderPopUp(item);

                item.setAnimation(null);

                setActiveResultItem(item.id);

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

    function getTitleFromId(listType, id, opt){
        let title,
            newArr,
            result;

        if(id){
            switch (listType){
                case 'med_profile':

                    if(opt && opt == 'contact'){
                        result = MED_PROFILES_CONTACT_LIST.filter(item => item.ID == id)[0];

                    }else{
                        result = MED_PROFILES_COMPANY_LIST.filter(item => item.ID == id)[0];
                    }

                    break;

                case 'cooperation':

                    if(opt && opt == 'contact'){
                        result = COOPERATIONS_CONTACT_LIST.filter(item => item.ID == id)[0];

                    }else{
                        result = COOPERATIONS_COMPANY_LIST.filter(item => item.ID == id)[0];
                    }

                    break;

                case 'status':
                    result = STATUSES_COMPANY_LIST.filter(item => item.ID == id)[0];

                    break;

                case 'sex':
                    result = SEX_LIST.filter(item => item.ID == id)[0];

                    break;

            }

            title = result ? result.VALUE : null;
        }


        return title;
    }

    function renderPopUp(item) {

        console.log('renderPopUp() -> item', item);

        let {title, type, address, schedule, id, phone_work, phone_fax, phone_mobile, cooperation, status, sex, med_profile, wochenende, ausendienst} = item; // item data
        let med_profiles = '';
        let profile;
        let BxItemURL;

        if(type != 'doctor'){
            BxItemURL = '/crm/company/details/';
        }else{
            BxItemURL = '/crm/contact/details/';
        }

        if(med_profile.length){


            med_profile = med_profile.map(item => {
                return getTitleFromId('med_profile', item, !sex ? 'clinic' : 'contact');

            });

            for(let i = 0; i < med_profile.length; i++){

                if(med_profile[i]){
                    if(i != (med_profile.length - 1)){
                        profile = med_profile[i] + ',&nbsp;';

                    }else{
                        profile = med_profile[i];

                    }

                    med_profiles += profile;
                }

            }

        }

        if(cooperation){
            cooperation = getTitleFromId('cooperation', cooperation, !sex ? 'clinic' : 'contact');
        }

        if(status){
            status = getTitleFromId('status', status, null);
        }

        if(sex){
            sex = getTitleFromId('sex', sex, null);
        }


        let infoWindowContent = `
          <div class="popUp">
              <h3 style="font-weight: 700;"><a href="${BxItemURL}${id}/" target="_blank">${title}</a></h3>
              <p>Addess:&nbsp;${address}</p>
              ${med_profiles ? '<p>Медпрофиль:&nbsp;' + med_profiles + '</p>' : ''}
              ${cooperation ? '<p>Cooperation:&nbsp;' + cooperation + '</p>' : ''}
              ${wochenende != null ? '<p>Wochenende:&nbsp;' + wochenende + '</p>' : ''}
              ${ausendienst != null ? '<p>Ausendienst:&nbsp;' + ausendienst + '</p>' : ''}
              ${status != null ? '<p>Status:&nbsp;' + status + '</p>' : ''}
              ${phone_work ? '<p>Work:&nbsp;<a href="tel:' + phone_work + '">' + phone_work + '</a></p>' : ''}
              ${phone_fax ? '<p>Fax:&nbsp;' + phone_fax + '</p>' : ''}
              ${phone_mobile ? '<p>Mobile:&nbsp;<a href="tel:' + phone_mobile + '">' + phone_mobile + '</a></p>' : ''}
              ${type == 'doctor' && sex ? '<p>Sex:&nbsp;' + sex + '</p>' : ''}
          </div>
        `;

        if(POP_UP_IS_ACTIVE){
            POP_UP_IS_ACTIVE.close();
        }

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infoWindow.open(map, item);

        POP_UP_IS_ACTIVE = infoWindow;
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

                switch (markersList[i].type){
                    case 'clinic':
                        type = 'Clinic';
                        break;

                    case 'praxis':
                        type = 'Praxis';
                        break;

                    case 'doctor':
                        type = 'Doctor';
                        break;
                }

                //type = markersList[i].type == 'clinic' ? 'Clinic' : 'Praxis';

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
                  <p class="info">${markersList[i].schedule ? 'Open:&nbsp;<span class="value">'  + markersList[i].schedule + '</span>,&nbsp;' : ''}<span class="type hospital">${type}</span></p>
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

    function getAddParams(param){

        const emptyValue = "default"; //"-- Выберите --"
        const paramName = param.name;
        const paramValue = param.value;
        const paramTitle = param.text || null;

        console.log('param: ', param);

        if(paramName == 'radius'){

            if(paramValue != 0){
                RADIUS = +paramValue;

            }else{

                RADIUS = 100000000000;
            }

            geocodeAddress();

            FILTER_PARAMS.radius = RADIUS;

        }else{

            if(paramValue != emptyValue){
                FILTER_PARAMS[paramName] = paramValue;

            }else{
                FILTER_PARAMS[paramName] = null;
            }

        }
        //console.log('paramValue: ', paramValue);

        filter(FILTER_PARAMS.type, FILTER_PARAMS);
    }

    function filter(type, addParams) {

        let locFilterArr = LOCATIONS;
        let filterParamsKeys = [];
        let itemKey;

        if(!addParams){
            FILTER_PARAMS = {};
        }

        FILTER_PARAMS.radius = RADIUS;
        FILTER_PARAMS.type = type.toLowerCase();

        console.log('FILTER_PARAMS: ', FILTER_PARAMS);

        locFilterArr = locFilterArr.filter(item => {

            return item.DISTANCE <= FILTER_PARAMS.radius / 1000;

        });

        if(FILTER_PARAMS.type == 'all'){

            locFilterArr = locFilterArr.filter(item => item.TYPE == 'clinic' || item.TYPE == 'praxis' || item.TYPE == 'doctor'); // locFilterArr = LOCATIONS;

            //console.log('locFilterArr: ', locFilterArr);

        }else if(FILTER_PARAMS.type == 'clinics' || FILTER_PARAMS.type == 'praxis' || FILTER_PARAMS.type == 'doctors'){

            filterParamsKeys = Object.keys(FILTER_PARAMS);

            switch (FILTER_PARAMS.type){
                case 'clinics':
                    type = 'clinic';
                    break;

                case 'praxis':
                    type = 'praxis';
                    break;

                case 'doctors':
                    type = 'doctor';
                    break;
            }

            filterParamsKeys.forEach(function(key){

                if(FILTER_PARAMS[key] != null){

                    locFilterArr = locFilterArr.filter(item => {

                        itemKey = item[key.toUpperCase()];

                        if(key == 'type'){
                            return item.TYPE == type;

                        }else if(key == 'med_profile'){

                            let result;

                            FILTER_PARAMS[key].forEach(function(paramKey){

                                //console.log('paramKey: ', paramKey);

                                if(itemKey && itemKey.indexOf(paramKey) != -1){

                                    result = item || null;
                                    return item;

                                }
                            });

                            return result;

                        }else if(key != 'radius'){

                            return itemKey == FILTER_PARAMS[key];

                        }else{
                            // if 'radius'
                            return item;
                        }

                    });

                }

            });

            // Дежурная клиника
        }else if(FILTER_PARAMS.type == 'notdienst'){
            locFilterArr = locFilterArr.filter(item =>
                item.INDUSTRY && (item.INDUSTRY.toLowerCase() == 17 || item.INDUSTRY.toLowerCase() == 14) );

        }else if(FILTER_PARAMS.type == 'taxi'){
            locFilterArr = locFilterArr.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 21 );

        }else if(FILTER_PARAMS.type == 'krankenwahgentransport'){
            locFilterArr = locFilterArr.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 18 );

        }else if(FILTER_PARAMS.type == 'privatärztlichenotdienst'){
            locFilterArr = locFilterArr.filter(item => item.INDUSTRY && item.INDUSTRY.toLowerCase() == 22 );
        }

        //if(activeFilter !== type){

        filterResultCounter.innerHTML = locFilterArr.length;

        removeMarkers();
        setMarkers(locFilterArr, animationDrop);

        activeFilter = type;
        //}

    }

}
