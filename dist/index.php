<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
    <!--<link rel="stylesheet" href="./css/styles.min.css">-->
    <link rel="stylesheet" href="./css/jquery.formstyler.css">
    <link rel="stylesheet" href="./css/jquery.formstyler.theme.css">

    <!-- @if NODE_ENV='production' -->

    <link rel="stylesheet" href="./css/styles.min.css">
    <!-- @endif -->

    <!-- @if NODE_ENV='develop' -->
    <link rel="stylesheet" href="./css/styles.css">
    <!-- @endif -->

    <!--<script src="//api.bitrix24.com/api/v1/"></script> -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <title>Map application</title>

</head>
<body>

<div class="container">
    <div id="filter" class="filter">
        <div class="filter__toggle" data-status="show">
            <div class="filter__toggle__inner show">
                <span class="letter">H</span>
                <span class="letter">i</span>
                <span class="letter">d</span>
                <span class="letter">e</span>
            </div>
            <div class="filter__toggle__inner hidden">
                <span class="letter">S</span>
                <span class="letter">h</span>
                <span class="letter">o</span>
                <span class="letter">w</span>
            </div>
        </div>

        <div class="filter__wrap">
            <div class="filter__header">
                <div class="filter__header__search">

                    <div class="filter__header__inner search js-search-block">
                        <input type="text" id="searchField" class="field search-field" placeholder="Поиск" />
                        <span id="searchFind" class="fas fa-search find-icon js-find"></span>
                        <span id="searchClear" class="fas fa-times clear-icon js-clear"></span>
                    </div>

                    <div class="filter__header__inner direction js-direction-block hidden">
                        <div class="block">
                            <input type="text" id="directionFrom" class="field direction-field" placeholder="Укажите пункт отправления..." />
                            <span id="directionFromClear" class="fas fa-times clear-icon js-clear"></span>
                        </div>

                        <div class="block">
                            <input type="text" id="directionTo" class="field direction-field" placeholder="Укажите пункт назначения..." />
                            <span id="directionToClear" class="fas fa-times clear-icon js-clear"></span>
                        </div>
                    </div>

                    <div class="direction__menu">
                        <div class="to-searching js-to-searching">Вернуться к поиску</div>
                        <div class="get-directions js-get-directions">Проложить маршрут</div>
                    </div>

                </div>

                <div class="filter__header__params js-filter-params-wrap">

                    <div class="filter__header__params__inner">

                        <div class="btns">
                            <label for="show-all" class="filter__label js-params-basic-btn js-all">
                                <input type="radio" id="show-all" name="filter-basic" class="filter__radio" data-type="all" checked />
                                All
                            </label>

                            <label for="show-clinics" class="filter__label js-params-basic-btn js-clinics">
                                <input type="radio" id="show-clinics" name="filter-basic" class="filter__radio" data-type="clinics" />
                                Clinics
                            </label>

                            <label for="show-doctors" class="filter__label js-params-basic-btn js-doctors">
                                <input type="radio" id="show-doctors" name="filter-basic" class="filter__radio" data-type="doctors" />
                                Doctors
                            </label>
                        </div>
                        <div class="filter__header__open js-toggle-filters-list">Additional<!-- <span class="arrow">&gt;</span>--></div>
                    </div>

                    <ul class="filter__header__params__list js-filter-params">
                        <span class="close js-filter-params-close">x</span>
                        <li class="filter__header__params__item js-all">
                            1
                        </li>

                        <li class="filter__header__params__item js-clinic">
                            2
                        </li>

                        <li class="filter__header__params__item js-doctor">
                            3
                        </li>

                        <li class="filter__header__params__item js-duty-Clinic">
                            4
                        </li>

                        <li class="filter__header__params__item js-aussendienst">
                            5
                        </li>
                    </ul>
                </div>

            </div>

            <div class="filter__result">
                <ul class="filter__result__list" id="resultList">

                </ul>
            </div>
        </div>

    </div>

    <div class="map" id="map"></div>
</div>

<script src="./js/jquery.formstyler.min.js"></script>
<script src="./js/main.js"></script>
<script async defer src="//maps.googleapis.com/maps/api/js?key=AIzaSyBeVoPDyYZyUq-h735KGeK4OA9-BEuecBg&libraries=places&callback=initMap"></script>
</body>
</html>