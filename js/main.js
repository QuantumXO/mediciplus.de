
function initApp(){
    const PLACEMENT = BX24.placement.info();
    //console.log("PLACEMENT: ", PLACEMENT);

    if(PLACEMENT.placement == "CRM_CONTACT_DETAIL_TAB"){
        getClientOrCompanyAddress(PLACEMENT.options.ID, 'contact');

    }else if(PLACEMENT.placement == "CRM_COMPANY_DETAIL_TAB"){
        getClientOrCompanyAddress(PLACEMENT.options.ID, 'company');

    }else{
        initMap();
    }
}

function getClientOrCompanyAddress(id, type){

    //console.log('getClientOrCompanyAddress()');

    const CRMUrl = type == 'contact' ? 'crm.contact.get' : 'crm.company.get';

    BX24.callMethod(
        CRMUrl,
        { id: id },
        function(result){

            console.log("result: ", result);

            if(result.error())
                console.error(result.error());

            else{
                const searchField = document.querySelector('#searchField');
                let resultData = result.data(),
                    COUNTRY,
                    CITY,
                    ADDRESS,
                    ADDRESS_2,
                    UF_CRM_1559428470374;

                COUNTRY = resultData.ADDRESS_COUNTRY ? resultData.ADDRESS_COUNTRY + ' ' : '';
                CITY = resultData.ADDRESS_CITY ? resultData.ADDRESS_CITY + ' ' : '';
                ADDRESS = resultData.ADDRESS ? resultData.ADDRESS + ' ' : '';
                ADDRESS_2 = resultData.ADDRESS_2 ? resultData.ADDRESS_2 + ' ' : '';
                UF_CRM_1559428470374 = resultData.UF_CRM_1559428470374 ? resultData.UF_CRM_1559428470374 + ' ' : '';

                if(COUNTRY || CITY || ADDRESS || ADDRESS_2){
                    searchField.value = COUNTRY + CITY + ADDRESS + ADDRESS_2;

                    initMap();
                }else if(UF_CRM_1559428470374){
                    searchField.value = UF_CRM_1559428470374;
                    initMap();

                }else{
                    if(type == 'contact'){
                        getClientOrCompanyRequisite(3, id);
                    }else{
                        getClientOrCompanyRequisite(4, id);
                    }

                }

            }
        }
    );
}

function getClientOrCompanyRequisite(ENTITY_TYPE_ID, ENTITY_ID){

    //console.log('getClientOrCompanyRequisite()');

    /*
     ENTITY_TYPE_ID:
     {ID: 3, NAME: "Контакт"}
     {ID: 4, NAME: "Компания"}
     {ID: 8, NAME: "Реквизиты"}

     ENTITY_ID - ID contact/company
     */

    BX24.callMethod(
        "crm.requisite.list", {
            order: {"ENTITY_ID": "ASC"},
            filter: {
                "ENTITY_TYPE_ID": ENTITY_TYPE_ID,
                "ENTITY_ID": ENTITY_ID
            },
            select: ["ID"]
        },function (result){
            if(result.error()){
                console.error(result.error());

            }else{
                //console.log("crm.requisite.list() -> result: ", result);
                //console.log('crm.requisite.list ID: ', result.data()[0].ID);
                getAddressFromRequisite(result.data()[0].ID);

            }
        }
    );

}

function getAddressFromRequisite(requisiteId){
    //console.log('getAddressFromRequisite()');
    BX24.callMethod(
        'crm.address.list',
        {
            filter: {
                'ENTITY_TYPE_ID': 8,
                "ENTITY_ID": requisiteId
            },
            select: ['COUNTRY', 'CITY', 'ADDRESS_1', 'ADDRESS_2', 'REGION', 'PROVINCE']
        },function (result){
            if(result.error()){
                console.error(result.error());
            }else{

                //console.log('crm.address.list: ', result.data());

                const searchField = document.querySelector('#searchField');
                let resultData = result.data()[0],
                    COUNTRY,
                    CITY,
                    PROVINCE,
                    REGION,
                    POSTAL_CODE,
                    ADDRESS_1,
                    ADDRESS_2;

                COUNTRY = resultData.COUNTRY ? resultData.COUNTRY + ' ' : '';
                CITY = resultData.CITY ? resultData.CITY + ' ' : '';
                ADDRESS_1 = resultData.ADDRESS_1 ? resultData.ADDRESS_1 + ' ' : '';
                ADDRESS_2 = resultData.ADDRESS_2 ? resultData.ADDRESS_2 + ' ' : '';
                REGION = resultData.REGION ? resultData.REGION + ' ' : '';
                PROVINCE = resultData.PROVINCE ? resultData.PROVINCE + ' ' : '';

                if(COUNTRY || CITY || ADDRESS_1 || ADDRESS_2 || REGION || PROVINCE){
                    searchField.value = COUNTRY + REGION + CITY + ADDRESS_1 + ADDRESS_2;
                }

                initMap();
            }
        }
    );

}

////////////////////////////////////////////////////////////////////////////////
function initMap() {

    // Search
    const searchField = document.querySelector('#searchField');
    const searchFieldName = document.querySelector('#searchFieldName');
    const searchFields = document.getElementsByClassName('search-field');
    const searchFindBtn = document.getElementById('searchFind');

    // Filter
    const filterWrap = document.getElementById('filter');
    const filterRadius = document.getElementById('radius');
    const filterResultCounter = document.querySelector('.filter__result__counter .value');
    const filterParamsSelect = document.getElementsByClassName('filter__params__select')[0];
    const filterCustomList = document.getElementsByClassName('js-custom-filter-list')[0];
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
    const defaultZoom = 14;
    const geocoder = new google.maps.Geocoder();
    const directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    //const hospitalIcon = "./img/hospital.png";
    const hospitalIconPath = "M448 492v20H0v-20c0-6.627 5.373-12 12-12h20V120c0-13.255 10.745-24 24-24h88V24c0-13.255 10.745-24 24-24h112c13.255 0 24 10.745 24 24v72h88c13.255 0 24 10.745 24 24v360h20c6.627 0 12 5.373 12 12zM308 192h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12zm-168 64h40c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12zm104 128h-40c-6.627 0-12 5.373-12 12v84h64v-84c0-6.627-5.373-12-12-12zm64-96h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12zm-116 12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-40zM182 96h26v26a6 6 0 0 0 6 6h20a6 6 0 0 0 6-6V96h26a6 6 0 0 0 6-6V70a6 6 0 0 0-6-6h-26V38a6 6 0 0 0-6-6h-20a6 6 0 0 0-6 6v26h-26a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6z"
    //const hospitalIconWidth = 26;
    //const hospitalIconHeight = 33.8;
    //const hospitalIconWidthScaledSize = 31;
    //const hospitalIconHeightScaledSize = 38.8;
    //const doctorIcon = "./img/doctor.png";
    const doctorIconPath = "M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zM104 424c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24zm216-135.4v49c36.5 7.4 64 39.8 64 78.4v41.7c0 7.6-5.4 14.2-12.9 15.7l-32.2 6.4c-4.3.9-8.5-1.9-9.4-6.3l-3.1-15.7c-.9-4.3 1.9-8.6 6.3-9.4l19.3-3.9V416c0-62.8-96-65.1-96 1.9v26.7l19.3 3.9c4.3.9 7.1 5.1 6.3 9.4l-3.1 15.7c-.9 4.3-5.1 7.1-9.4 6.3l-31.2-4.2c-7.9-1.1-13.8-7.8-13.8-15.9V416c0-38.6 27.5-70.9 64-78.4v-45.2c-2.2.7-4.4 1.1-6.6 1.9-18 6.3-37.3 9.8-57.4 9.8s-39.4-3.5-57.4-9.8c-7.4-2.6-14.9-4.2-22.6-5.2v81.6c23.1 6.9 40 28.1 40 53.4 0 30.9-25.1 56-56 56s-56-25.1-56-56c0-25.3 16.9-46.5 40-53.4v-80.4C48.5 301 0 355.8 0 422.4v44.8C0 491.9 20.1 512 44.8 512h358.4c24.7 0 44.8-20.1 44.8-44.8v-44.8c0-72-56.8-130.3-128-133.8z"
    //const doctorIconWidth = 26;
    //const doctorIconHeight = 33.8;
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
        SEARCH_ADDRESS_VALUE = searchField.value || null,
        SEARCH_NAME_VALUE = searchFieldName.value || null,
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
        FILTERED_LACATIONS_LIST,
        LANGUAGES_LIST;

    let clientMarker,
        FILTER_PARAMS = {
            type: 'All',
            radius: RADIUS
        },
        clientMarkerRadius,
        CLIENT_ID,
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

    $(".profile").on("select2:select select2:unselect", function (e) {

        //this returns all the selected item
        const value = $(this).val();

        let data = {
            name: 'med_profile',
            value: value.length ? value : null,
        };

        getAddParams(data);

    });

    function initSelect2(){

        const select = $('select.filter__select');

        select.select2({minimumResultsForSearch: -1});

        select.on('select2:select', function(e){
            let data = e.params.data;

            if($(this).hasClass('js-custom-filter-list')){

                $('.js-btn.active').removeClass('active');

                filter(data.id, null);

            }else if(e.target.getAttribute('data-param') != 'med_profile'){
                data = {
                    name: e.target.getAttribute('data-param'),
                    value: data.id,
                    title: data.text,
                };

                getAddParams(data);
            }

        });

    }initSelect2();

    async function getClientLocation(newClientAddress){

        CLIENT_ADDRESS = searchField.value.replace(/ /gi, '+') || null;
        newClientAddress = newClientAddress ? newClientAddress : null;

        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${CLIENT_ADDRESS}&key=AIzaSyCZLQh0F2FUbMOz0lcd6E0sahcxwuXA3NA&libraries`);
        const data = await response.json();


        if(data.status == 'OK'){

            CLIENT_LAT = +data.results[0].geometry.location.lat;
            CLIENT_LNG = +data.results[0].geometry.location.lng;

            await getData(newClientAddress);

        }else{
            console.log('getClientLocation() -> error: ', data);
        }

    }getClientLocation();

    function getData(newClientAddress){

        if(newClientAddress){
            let distance,
                lat,
                lng;

            LOCATIONS = LOCATIONS.map(function(item){

                item.LAT = +item.LAT || 0;
                item.LNG = +item.LNG || 0;

                lat = item.LAT;
                lng = item.LNG;

                distance = getDistanceFromLatLonInKm(+CLIENT_LAT, +CLIENT_LNG, +lat, +lng);
                item.DISTANCE = Math.round(distance);

                //filter(FILTER_PARAMS.type, FILTER_PARAMS);
            })

        }else{

            fetch(dataURL, {cache: "no-store"})
                .then(response => {
                    if(response.status == 200){
                        return response.json();
                    }
                })
                .then(function(data) {

                    //console.log('getData() -> data: ', data);

                    if(data){

                        /*if(placement_id){

                         CLIENT_ADDRESS = data.filter(item => item.ID == placement_id)[0].ADDRESS;
                         searchField.value = CLIENT_ADDRESS;

                         console.log('getData() -> CLIENT_ADDRESS: ', CLIENT_ADDRESS);

                         getClientLocation();
                         }*/

                        data.forEach(function(item, i){

                            let lat,
                                lng,
                                type,
                                icon,
                                COOPERATION = item.COOPERATION,
                                color = "#808080",
                                distance,
                                position;

                            if(!item.TYPE && item.INDUSTRY) {

                                if(item.INDUSTRY.toLowerCase() == 17 || item.INDUSTRY.toLowerCase() == 14){
                                    item.TYPE = 'notdienst';
                                }else if(item.INDUSTRY.toLowerCase() == 21){
                                    item.TYPE = 'taxi';
                                }else if(item.INDUSTRY.toLowerCase() == 18){
                                    item.TYPE = 'krankenwahgentransport';
                                }else if(item.INDUSTRY.toLowerCase() == 22){
                                    item.TYPE = 'privatärztlichenotdienst';

                                }
                            }

                            // Ні
                            if(COOPERATION == 1201 || COOPERATION == 1193){

                                // В процесі домовленості
                            }else if(COOPERATION == 1203 || COOPERATION == 1195){
                                color = "#FFFF00";

                                // Відмова від співпраці
                            }else if(COOPERATION == 1205 || COOPERATION == 1197){
                                color = "#FF0100";

                                // Співпраця
                            }else if(COOPERATION == 1207 || COOPERATION == 1199){
                                color = "#018000";

                                // Співпрацю призупинено
                            }else if(COOPERATION == 1216 || COOPERATION == 1209){
                                color = "#FFA500";

                            }

                            if(item.TYPE == 'clinic'){
                                item.ICON = {
                                    //url: hospitalIcon,
                                    //scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight),
                                    path: hospitalIconPath,
                                    anchor: new google.maps.Point(0,0),
                                    fillColor: color,
                                    fillOpacity: 1,
                                    scale: .05
                                };

                            }else{
                                item.ICON = {
                                    //url: doctorIcon,
                                    //scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight),
                                    path: doctorIconPath,
                                    anchor: new google.maps.Point(0,0),
                                    fillColor: color,
                                    fillOpacity: 1,
                                    scale: .05
                                };
                            }

                            item.LAT = +item.LAT || 0;
                            item.LNG = +item.LNG || 0;

                            lat = item.LAT;
                            lng = item.LNG;

                            item.POSITION = {lat: lat, lng: lng};

                            distance = getDistanceFromLatLonInKm(+CLIENT_LAT, +CLIENT_LNG, +lat, +lng);

                            item.SEX = item.SEX || null;
                            item.COMMENTS = item.COMMENTS || null;
                            item.STATUS = item.STATUS || null;
                            item.SCHEDULE = item.SCHEDULE || null;
                            item.DISTANCE = Math.round(distance);

                        });

                        LOCATIONS = data;

                        //console.log('getData() -> LOCATIONS: ', LOCATIONS);

                        getFieldsValues();

                        //setMarkers(LOCATIONS, animationDrop); // first init of markers
                    }

                });
        }

    }

    const getFieldsValues = async () => {

        const data = await fetch('/map/get-fields.php')
            .then(response => response.json());

        if(data){
            //console.log('data: ', data);

            INDUSTRY_LIST = data.contactFilter[0].INDUSTRY.LIST.map(function(item){
                return {ID: item.STATUS_ID, VALUE: item.NAME};
            });
            COUNTRY_LIST = data.contactFilter[3].COUNTRY.LIST;
            LANGUAGES_LIST = data.contactFilter[4].SPRACHE.LIST;
            MED_PROFILES_CONTACT_LIST = data.contactFilter[2].MED_PROFILE.LIST;
            MED_PROFILES_COMPANY_LIST = data.companyFilter[2].MED_PROFILE.LIST;
            STATUSES_CONTACT_LIST = data.contactFilter[5].STATUS.LIST;
            STATUSES_COMPANY_LIST = data.companyFilter[4].STATUS.LIST;
            COOPERATIONS_CONTACT_LIST = data.contactFilter[1].COOPERATION.LIST;
            COOPERATIONS_COMPANY_LIST = data.companyFilter[1].COOPERATION.LIST;

            setOptions([
                {
                    FIELD_NAME: 'industry',
                    LIST: INDUSTRY_LIST,
                },
                {
                    FIELD_NAME: 'country',
                    LIST: COUNTRY_LIST,
                },
                {
                    FIELD_NAME: 'language',
                    LIST: LANGUAGES_LIST,
                },
                {
                    FIELD_NAME: 'cooperation',
                    LIST: COOPERATIONS_COMPANY_LIST,
                },
                {
                    FIELD_NAME: 'cooperation_contact',
                    LIST: COOPERATIONS_CONTACT_LIST,
                },
                {
                    FIELD_NAME: 'profile',
                    LIST: MED_PROFILES_COMPANY_LIST,
                },
                {
                    FIELD_NAME: 'profile_contact',
                    LIST: MED_PROFILES_CONTACT_LIST,
                },
                {
                    FIELD_NAME: 'status_company',
                    LIST: STATUSES_COMPANY_LIST,
                },
                {
                    FIELD_NAME: 'status_contact',
                    LIST: STATUSES_CONTACT_LIST,
                },
            ]);
        }

        filter(FILTER_PARAMS.type, FILTER_PARAMS);

    };

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

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Map init

    //UF_CRM_1387031615 -- Мед. Профиль (company)
    //UF_CRM_1425472914 -- Auserdinst (contact)
    //UF_CRM_1388085826 -- Status (contact) // crm.contact.userfield.list
    //UF_CRM_1553940264 -- wochenede (contact)
    //UF_CRM_1553940316 -- wochenede (company)

    function setOptions(listsArr){

        const countrtSelect = document.querySelectorAll('select.country');
        const cooperationSelectCompany = document.querySelectorAll('select.cooperation--company');
        const cooperationSelectContact = document.querySelectorAll('select.cooperation--contact');
        const profileSelectCompany = document.querySelectorAll('select.profile--company');
        const profileSelectContact = document.querySelectorAll('select.profile--contact');
        const industrySelect = document.querySelectorAll('select.industry');
        const statusSelectCompany = document.querySelectorAll('select.status--company');
        const statusSelectContact = document.querySelectorAll('select.status--contact');
        const languageSelect = document.querySelectorAll('select.sprache');

        for(let i = 0; i < listsArr.length; i++){
            const name = listsArr[i].FIELD_NAME;
            const list = listsArr[i].LIST;

            if(list){

                if(name == 'country'){
                    mapping(countrtSelect, list);
                }else if(name == 'cooperation'){
                    mapping(cooperationSelectCompany, list);
                }else if(name == 'profile'){
                    mapping(profileSelectCompany, list);
                }else if(name == 'industry'){
                    mapping(industrySelect, list);
                }else if(name == 'status_company'){
                    mapping(statusSelectCompany, list);
                }else if(name == 'language'){
                    mapping(languageSelect, list);
                }else if(name == 'status_contact'){
                    mapping(statusSelectContact, list);
                }else if(name == 'cooperation_contact'){
                    mapping(cooperationSelectContact, list);
                }else if(name == 'profile_contact'){
                    mapping(profileSelectContact, list);
                }
            }

        }

        function mapping(node, list){

            let itemValue,
                itemId;
            const fragment = document.createDocumentFragment();

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
            }
        }

    }

    if(SEARCH_ADDRESS_VALUE){
        searchField.value = SEARCH_ADDRESS_VALUE;

        geocodeAddress();
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

        let from = SEARCH_ADDRESS_VALUE;
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

            if(!btnActive || (btnActive && itemType != btnActive.getAttribute('data-type'))){
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

        let address;

        address = SEARCH_ADDRESS_VALUE;


        //lastAddress = address;

        //console.log('address: ', address);

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {

                if(clientMarker){
                    clientMarker.setVisible(false);
                    clientMarkerRadius.setMap(null);
                }

                clientMarker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });

                map.setCenter(results[0].geometry.location);

                clientMarkerRadius = new google.maps.Circle({
                    strokeColor: '#00B1DA',
                    strokeOpacity: 0, // 0.3
                    strokeWeight: 1,
                    fillColor: '#00B1DA',
                    fillOpacity: 0, // 0.2
                    map: RADIUS != 100000000000 ? map : null,
                    center: results[0].geometry.location,
                    radius: RADIUS // in meters
                });

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

    }

    searchFieldName.addEventListener('click', initRealTimeSearch);
    searchFieldName.addEventListener('keyup', initRealTimeSearch);

    function initRealTimeSearch(){
        realTimeSearch(this.value);
    }

    function realTimeSearch(query){

        const searchList = document.querySelectorAll('.search__list')[0];

        if(searchList){
            searchList.remove();
        }

        const resultList = document.createElement('ul');
        const resultFragment = document.createDocumentFragment();

        resultList.classList.add('search__list');

        if(FILTERED_LACATIONS_LIST){

            let resultArr = FILTERED_LACATIONS_LIST.filter( function(item) {
                return item.TITLE.toLowerCase().indexOf(query.toLowerCase()) != -1;
            });

            resultArr.forEach(item => {
                const resultItem = document.createElement('li');

                resultItem.classList.add('search__item');
                resultItem.classList.add('js-custom-search-item');
                resultItem.setAttribute('data-id', item.ID);
                resultItem.setAttribute('data-lat', item.LAT);
                resultItem.setAttribute('data-lng', item.LNG);


                resultItem.innerHTML = item.TITLE;
                resultFragment.appendChild(resultItem);
            });

            resultList.appendChild(resultFragment);
            searchField.parentNode.appendChild(resultList);
        }

        //console.log('resultArr: ', resultArr);

        return;
    }

    function autocompliteFunc() {
        let autocomplete;

        autocomplete = new google.maps.places.Autocomplete(searchField);
        autocomplete.bindTo('bounds', map);

        let directionMarker = new google.maps.Marker({
            map: map,
            icon: {
                url: directionFromIcon,
                scaledSize: new google.maps.Size(35, 35)
            },
            anchorPoint: new google.maps.Point(0, -29)
        });

        searchField.addEventListener('keyup', function () {
            SEARCH_ADDRESS_VALUE = this.value;
        });

        autocomplete.addListener('place_changed', function() {

            directionMarker.setVisible(false);

            let place = autocomplete.getPlace();

            SEARCH_ADDRESS_VALUE = searchField.value || null;

            getClientLocation(SEARCH_ADDRESS_VALUE);

            directionMarker.setVisible(true);

            geocodeAddress(geocoder, map);
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
                        filterBlock[1].classList.add('hidden');
                        filterBlock[2].classList.remove('hidden');
                        directionFieldsWrap.classList.add('show');

                        APP_STATUS = 1;
                    }

                    itemWrap = item.closest('.filter__result__item');
                    itemId = itemWrap.getAttribute('data-item-id');
                    linkAddress = item.getAttribute('data-direction');

                    directionFromField.value = SEARCH_ADDRESS_VALUE;
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
        filterBlock[1].classList.remove('hidden');
        filterBlock[2].classList.add('hidden');
        directionFieldsWrap.classList.remove('show');

        document.querySelector('.filter__result__item.active').classList.remove('active');

        APP_STATUS = 0; // search

        searchField.value = SEARCH_ADDRESS_VALUE ? SEARCH_ADDRESS_VALUE : null; // value from direction field

        toggleStateOfResultItems();

        getDirections();

    });

    function getDirections(travelType){

        TRAVEL_TYPE = travelType ? travelType : TRAVEL_TYPE;

        let itemWrap = document.querySelector('.filter__result__item.active') || null;

        // value from direction field
        directionFromField.value = SEARCH_ADDRESS_VALUE ? SEARCH_ADDRESS_VALUE : null;

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
        const showDetails = document.querySelectorAll('.js-more');

        [].slice.call(showDetails).forEach(function(item){

            item.addEventListener('click', function(){
                console.log('this: ', this);
                this.closest('.filter__result__item').querySelectorAll('.js-details')[0].classList.toggle('show');
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
                comments: element.COMMENTS,
                status: element.STATUS,
                med_profile: element.MED_PROFILE,
                industry: element.INDUSTRY,
                wochenede: element.WOCHENENDE,
                cooperation: element.COOPERATION,
                phone_fax: element.PHONE_FAX,
                phone_mobile: element.PHONE_MOBILE,
                phone_work: element.PHONE_WORK,
                sprache: element.SPRACHE,
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
    }

    //setMarkers(LOCATIONS, animationDrop); // first init of markers

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

                case 'industry':
                    //console.log('INDUSTRY_LIST: ', INDUSTRY_LIST);

                    //result = INDUSTRY_LIST.filter(item => item.STATUS_ID == id)[0];
                    break;

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

                case 'sprache':
                    result = LANGUAGES_LIST.filter(item => item.ID == id)[0];

                    break;

            }

            title = result ? result.VALUE : null;
        }


        return title;
    }

    function renderPopUp(item) {

        //console.log('renderPopUp() -> item', item);

        let {title, type, address, schedule, id, phone_work, phone_fax, phone_mobile, cooperation, status, sex, med_profile, wochenende, ausendienst} = item; // item data
        let med_profiles = '';
        let profile;
        let BxItemURL;
        let additional;

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

    function renderList(lacationsArr){

        lacationsArr = lacationsArr ? lacationsArr : LOCATIONS;

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const lacationsArrLength = lacationsArr.length;

        let newResultItem;

        resultList.innerHTML = ''; // Clear list

        //console.log('renderList(lacationsArr): ', lacationsArr);

        if(lacationsArrLength){
            for(let i = 0; i < lacationsArrLength; i++){

                let profile,
                    med_profiles = '',
                    cooperation,
                    sex,
                    sprache,
                    type,
                    status,
                    language,
                    languages = '',
                    med_profile;

                switch (lacationsArr[i].TYPE){
                    case 'clinic':
                        type = 'Clinic';
                        break;

                    case 'praxis':
                        type = 'Praxis';
                        break;

                    case 'doctor':
                        type = 'Doctor';
                        break;

                    default:
                        type = lacationsArr[i].type;
                        break;
                }

                if(lacationsArr[i].MED_PROFILE.length){

                    med_profile = lacationsArr[i].MED_PROFILE.map(item => {
                        return getTitleFromId('med_profile', item, !lacationsArr[i].SEX ? 'clinic' : 'contact');

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

                if(lacationsArr[i].COOPERATION){
                    cooperation = getTitleFromId('cooperation', lacationsArr[i].COOPERATION, !lacationsArr[i].SEX ? 'clinic' : 'contact');
                }

                if(lacationsArr[i].STATUS){
                    status = getTitleFromId('status', lacationsArr[i].STATUS, null);
                }

                if(lacationsArr[i].SPRACHE && lacationsArr[i].SPRACHE.length){

                    //console.log('markersList[i].sprache: ', markersList[i].sprache);

                    sprache = lacationsArr[i].SPRACHE.map(item => {
                        return getTitleFromId('sprache', item, null);
                    });

                    for(let i = 0; i < sprache.length; i++){

                        if(sprache[i]){
                            if(i != (sprache.length - 1)){
                                language = sprache[i] + ',&nbsp;';

                            }else{
                                language = sprache[i];

                            }

                            languages += language;
                        }

                    }

                }

                if(lacationsArr[i].SEX){
                    sex = getTitleFromId('sex', lacationsArr[i].SEX, null);
                }

                //type = markersList[i].type == 'clinic' ? 'Clinic' : 'Praxis';

                newResultItem = document.createElement('li');
                newResultItem.classList.add('filter__result__item');
                newResultItem.setAttribute('data-item-id', lacationsArr[i].ID);

                if(lacationsArr[i].id == ACTIVE_RESULT_ITEM_ID){
                    newResultItem.classList.add('active');
                }

                newResultItem.innerHTML = `
                    <h3 class="title">
                        <a 
                            href="#"
                            class="to-center-link js-to-center-link" 
                            data-lat="${lacationsArr[i].LAT}" 
                            data-lng="${lacationsArr[i].LNG}"
                            data-marker-id="${lacationsArr[i].ID}"
                        >
                            ${lacationsArr[i].TITLE}
                        </a>
                    </h3>
                    <p class="info">
                        ${lacationsArr[i].SCHEDULE ? 'Open:&nbsp;<span class="value">'  + lacationsArr[i].SCHEDULE + '</span>,&nbsp;' : ''}
                        ${type ? '<span class="type">'  + type + '</span>' : ''}
                    </p>
                    <p class="address">${lacationsArr[i].ADDRESS}</p>
                    ${med_profiles ? "<p class='info'>" + med_profiles + "</p>" : ""}
                    ${cooperation ? "<p class='info'>" + cooperation + "</p>" : ""}
                    <div class="details js-details">
                        ${lacationsArr[i].PHONE_WORK ? '<p class="info">Work:&nbsp;<a href="tel:' + lacationsArr[i].PHONE_WORK + '">' + lacationsArr[i].PHONE_WORK + '</a></p>' : ''}
                        ${lacationsArr[i].PHONE_FAX ? '<p class="info">Fax:&nbsp;' + lacationsArr[i].PHONE_FAX + '</p>' : ''}</p>
                        ${lacationsArr[i].PHONE_MOBILE ? '<p class="info">Mobile:&nbsp;<a href="tel:' + lacationsArr[i].PHONE_MOBILE + '">' + lacationsArr[i].PHONE_MOBILE + '</a></p>' : ''}
                        ${languages ? '<p class="info">Languages:&nbsp;' + languages + '</p>' : ''}
                        ${status ? '<p class="info">Status:&nbsp;' + status + '</p>' : ''}
                        ${sex ? '<p class="info">Sex:&nbsp;' + sex + '</p>' : ''}
                        ${lacationsArr[i].WOCHENENDE != null ? '<p class="info">Wochenende:&nbsp;' + lacationsArr[i].WOCHENENDE + '</p>' : ''}
                        ${lacationsArr[i].AUSENDIENST != null ? '<p class="info">Ausendienst:&nbsp;' + lacationsArr[i].AUSENDIENST + '</p>' : ''}
                        ${lacationsArr[i].COMMENTS != null ? '<p class="info">Comments:&nbsp;' + lacationsArr[i].COMMENTS + '</p>' : ''}
                    </div>
                    <div class="bottom">
                        <a href="#" class="direction js-direction" data-direction="${lacationsArr[i].ADDRESS}">Get direction</a>
                        <a href="#" class="more js-more" data-marker-id="${lacationsArr[i].ID}">Details</a>
                    </div>

                    <div class="directions-info js-directions-info">
                        <div class="js-duration"></div>
                        <div class="distance js-distance"></div>
                    </div>
                 `;

                resultListFragment.appendChild(newResultItem);
            }

            resultList.appendChild(resultListFragment);

            direction(); // if exist results, we can create direction;
            showDetails(); // if exist results, we can show infoWindow;

        }else{
            //resultList.innerHTML = '<li class="filter__result__item">not found</li>';
            resultList.innerHTML = 'not found';
        }
    }

    document.addEventListener('click', function (e) {

        const target = e.target;
        const searchList = document.querySelectorAll('.search__list')[0];

        if(target.classList.contains('js-custom-search-item')){

            let found;

            SEARCH_NAME_VALUE = target.getAttribute('data-id');

            //if(SEARCH_NAME_VALUE){

            //console.log('SEARCH_NAME_VALUE: ', SEARCH_NAME_VALUE);

            searchFieldName.value = target.innerHTML;

            found = FILTERED_LACATIONS_LIST.filter(item => item.ID == SEARCH_NAME_VALUE);

            //console.log('found: ', found);

            renderList(found);

            //}

            target.parentNode.remove();
        }else if(
            searchList &&
            target.id != 'searchFieldName' &&
            !target.classList.contains('search__list') &&
            !target.closest('.search__list')
        ){
            //console.log('target: ', target);
            searchList.remove();
        }

    });

    function linkToCenterItem(map){

        const resultItemsLinks = document.querySelectorAll('.js-to-center-link');
        const resultItemsArr = [].slice.call(resultItemsLinks);

        let lat,
            lng,
            id;
        let center;

        document.addEventListener('click', function (e) {
            const target = e.target;

            if(target.classList.contains('js-to-center-link')){
                setActiveMarker(target);

                let markerId,
                    marker;

                markerId = target.getAttribute('data-marker-id');

                marker = allMarkers.filter(item => item.id == markerId)[0];

                setActiveResultItem(markerId);

                renderPopUp(marker, true);

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
            //map.setZoom(16);

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

            let field = this.parentNode.querySelectorAll('.field')[0];

            // fix re-render result list
            if(field.value){
                field.value = null;
            }

            if(item.classList.contains('address')){
                SEARCH_ADDRESS_VALUE = null;

            }else if(item.classList.contains('name')){
                const searchList = document.querySelectorAll('.search__list')[0];

                SEARCH_NAME_VALUE = null;

                if(searchList){
                    searchList.remove();
                }

                renderList(FILTERED_LACATIONS_LIST);
            }
        });
    });

    function getAddParams(param){

        const emptyValue = "default"; //"-- Выберите --"
        const paramName = param.name;
        const paramValue = param.value;
        const paramTitle = param.text || null;

        //console.log('param: ', param);

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

    function filter(type, addParams, $this) {

        FILTERED_LACATIONS_LIST = [];

        let locFilterArr = LOCATIONS;
        let filterParamsKeys = [];
        let itemKey;

        if(!addParams){
            FILTER_PARAMS = {};
        }

        FILTER_PARAMS.radius = RADIUS;
        FILTER_PARAMS.type = type.toLowerCase();

        if($this){

            //console.log('$this: ', $this);

            if($this.classList.contains('js-custom-search-item')){

                let CLIENT_LAT = $this.getAttribute('data-lat');
                let CLIENT_LNG = $this.getAttribute('data-lng');

                locFilterArr = locFilterArr.map(function(item){
                    item.DISTANCE = getDistanceFromLatLonInKm(+CLIENT_LAT, +CLIENT_LNG, +item.LAT, +item.LNG) || null;
                    return item;
                    //console.log('item.DISTANCE: ', item.DISTANCE);
                });

                //console.log('locFilterArr: ', locFilterArr);
            }

        }

        locFilterArr = locFilterArr.filter(item => {

            return item.DISTANCE <= FILTER_PARAMS.radius / 1000;

        });

        //console.log('locFilterArr: ', locFilterArr);

        if(FILTER_PARAMS.type == 'all'){

            locFilterArr = locFilterArr.filter(item => item.TYPE == 'clinic' || item.TYPE == 'praxis' || item.TYPE == 'doctor'); // locFilterArr = LOCATIONS;


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

                                paramKey = +paramKey;

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

        FILTERED_LACATIONS_LIST = locFilterArr;

        removeMarkers();
        setMarkers(locFilterArr, animationDrop);

        renderList(FILTERED_LACATIONS_LIST); // renders list of default markers

        activeFilter = type;
        //}

    }

}
