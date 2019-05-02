<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
    <!--<link rel="stylesheet" href="./css/styles.min.css">-->
    <link rel="stylesheet" href="./css/styles.css">
    <!--<script src="//api.bitrix24.com/api/v1/"></script> -->
    <!--<script src="//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> -->
    <title>Map application</title>
</head>
<body>
<div class="container">
    <div class="filter">
        <div class="filter__toggle" data-status="show">
            <span class="letter">H</span>
            <span class="letter">i</span>
            <span class="letter">d</span>
            <span class="letter">e</span>
        </div>
        <div class="filter__wrap">
            <div class="filter__header">
                <div class="filter__header__search">
                    <div class="filter__header__inner">
                        <input type="text" id="searchField" class="search-field" placeholder="Поиск" />
                        <span id="searchFind" class="fas fa-search find-icon js-find"></span>
                        <span id="searchClear" class="fas fa-times clear-icon js-clear"></span>
                    </div>
                </div>

                <div class="filter__header__btns">
                    <ul class="filter__header__btns__list js-filter-btns-wrap">
                        <li class="filter__header__btns__item js-all">
                            All
                        </li>

                        <li class="filter__header__btns__item js-clinic">
                            Clinic
                        </li>

                        <li class="filter__header__btns__item js-doctor">
                            Doctor
                        </li>

                        <li class="filter__header__btns__item js-duty-Clinic">
                            Duty
                        </li>

                        <li class="filter__header__btns__item js-aussendienst">
                            Ausendienst
                        </li>

                        <li class="filter__header__btns__item">
                            <span class="title"></span>
                        </li>

                        <li class="filter__header__btns__item">
                            <span class="title"></span>
                        </li>
                    </ul>
                </div>

            </div>

            <div class="filter__result">
                <ul class="filter__result__list" id="resultList">
                    <!--<li class="filter__result__item">
                        <h3 class="title">Киевская городская клиническая больница №17</h3>
                        <p class="info">Открыто:&nbsp;<span class="value">08:00–20:00</span>,&nbsp; <span class="type hospital">Больница</span></p>
                        <p class="address">14, вул. Кутузова, Киев, 02000</p>
                        <div class="bottom">
                            <a href="#" class="direction">Проложить маршрут</a>
                            <a href="#" class="more">Подробнее</a>
                        </div>
                    </li>-->
                </ul>
            </div>
        </div>

    </div>

    <div class="map" id="map"></div>
</div>

<script src="./js/main.js"></script>
<script async defer src="//maps.googleapis.com/maps/api/js?key=AIzaSyBeVoPDyYZyUq-h735KGeK4OA9-BEuecBg&callback=initMap"></script>
</body>
</html>