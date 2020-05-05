function numberFormat(number) {
    return new Intl.NumberFormat().format(number);
}

function hash() {
    return window.location.hash.replace("#", "");
}

function jump(h) {
    window.location.href = "#" + h;
}

function loadLang() {
    $("lang").each(function () {
        $(this).html(lang[$(this).attr("for")]);
    });
}

function valuesOfKey(list, key) {
    var filtered = [];
    $(list).each(function (a, b) {
        filtered.push(b[key]);
    });
    return filtered;
}

function beautifyDate(date) {
    date = date.split("-");
    if (current_lang === "pt") {
        return date[2] + "/" + lang.months[date[1] - 1];
    } else {
        return lang.months[date[1] - 1] + " " + date[2];
    }
}

function beautifyDates(dates) {
    $(dates).each(function (a, b) {
        dates[a] = beautifyDate(b);
    });
    return dates;
}

function colorForCountry(country) {
    if (country === "US") {
        return "#0572f8";
    } else if (country === "China") {
        return "#f80505";
    } else if (country === "Brazil") {
        return "#0dac12";
    } else if (country === "Italy") {
        return "#a7b01f";
    } else if (country === "Spain") {
        return "#ffa500";
    } else if (country === "France") {
        return "#00d0ff";
    } else if (country === "Germany") {
        return "#8d0000";
    } else if (country === "United Kingdom") {
        return "#7900ff";
    } else if (country === "Japan") {
        return "#ff00d4";
    }
}

function buildCharts() {
    var country = $("#country").select2("val");
    var c_data = data[country];
    var wrapper = $("#wrapper-chart");
    wrapper.html("<canvas height='200'></canvas>");
    new Chart(wrapper.find("canvas")[0], {
        type: "line",
        data: {
            labels: beautifyDates(valuesOfKey(c_data, "date")),
            datasets: [
                {
                    label: lang.confirmed,
                    data: valuesOfKey(c_data, "confirmed"),
                    fill: false,
                    borderColor: "#ffcc5c",
                    lineTension: 0,
                    pointRadius: 1,
                    borderWidth: 2
                },
                {
                    label: lang.deaths,
                    data: valuesOfKey(c_data, "deaths"),
                    fill: true,
                    borderColor: "#ff6f69",
                    backgroundColor: "rgba(255, 0, 0, 0.3)",
                    lineTension: 0,
                    pointRadius: 1,
                    borderWidth: 2
                },
                {
                    label: lang.recovered,
                    data: valuesOfKey(c_data, "recovered"),
                    fill: false,
                    borderColor: "#96ceb4",
                    lineTension: 0,
                    pointRadius: 0,
                    borderDash: [3, 3],
                    borderWidth: 2
                }
            ]
        },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function buildChartCompare() {
    $(["confirmed", "deaths", "recovered"]).each(function (a, attribute) {
        var wrapper = $("#wrapper-chart-compare-" + attribute);
        wrapper.html("<canvas height='200'></canvas>");
        var datasets = [];
        $(".flag.active").each(function () {
            var val = $(this).attr("value");
            datasets.push({
                label: val,
                data: valuesOfKey(data[val], attribute),
                fill: false,
                lineTension: 0,
                pointRadius: 1,
                borderWidth: 2,
                borderColor: colorForCountry(val)
            });
        });
        new Chart(wrapper.find("canvas")[0], {
            type: "line",
            data: {
                labels: beautifyDates(valuesOfKey(data.world, "date")),
                datasets: datasets
            }
        });
    });
}

var chart = null;
function buildMapChart(i) {
    if (data === false) {
        setTimeout(function () {
            buildMapChart();
        }, 500);
        return;
    }
    i = i === undefined ? data.world.length - 1 : i;
    var attribute = $("#map-buttons-world-map .btn-warning").attr("attribute");
    var cdata = [['Country', 'Deaths']];
    $(Object.keys(data)).each(function (a, b) {
        if (b !== "world") {
            cdata.push([b, data[b][i][attribute]]);
        }
    });

    var colors = ['#fff9f9', '#ffc9c9', '#ffa9a9', '#ff8989', '#ff6f69'];
    if (attribute === "confirmed") {
        colors = ["#F8F8F8", "#ffcc5c"];
    } else if (attribute === "recovered") {
        colors = ["#F8F8F8", "#88d8b0"];
    }

    var gdata = google.visualization.arrayToDataTable(cdata);

    var options = {
        colorAxis: {
            colors: colors
        },
        height: $("#wrapper-map").width() * 0.583
    };

    $("#wrapper-map").html("");
    if (chart === null) {
        chart = new google.visualization.GeoChart($("#wrapper-map")[0]);
    }
    chart.clearChart();
    chart.draw(gdata, options);
}

function updateCounters(country, i) {
    var d = data[country];
    i = i === undefined ? d.length - 1 : i;
    if (i > 0) {
        $("#counter_confirmed").html((country === "world" ? "" : '<div class="rank_counter">' + d[i].rank_confirmed + '&deg;</div>') + numberFormat(d[i].confirmed) + '<div class="counter_change' + (d[i].confirmed - d[i - 1].confirmed > 0 ? ' going-up"><i class="fas fa-caret-up"></i> ' : ' going-down"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].confirmed - d[i - 1].confirmed)) + '</div>');
        $("#counter_deaths").html((country === "world" ? "" : '<div class="rank_counter">' + d[i].rank_deaths + '&deg;</div>') + numberFormat(d[i].deaths) + '<div class="counter_change' + (d[i].deaths - d[i - 1].deaths > 0 ? ' going-up"><i class="fas fa-caret-up"></i> ' : ' going-down"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].deaths - d[i - 1].deaths)) + '</div>');
        $("#counter_recovered").html(numberFormat(d[i].recovered) + '<div class="counter_change' + (d[i].recovered - d[i - 1].recovered >= 0 ? ' going-down"><i class="fas fa-caret-up"></i> ' : ' going-up"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].recovered - d[i - 1].recovered)) + '</div>');
    } else {
        $("#counter_confirmed").html(numberFormat(d[i].confirmed));
        $("#counter_deaths").html(numberFormat(d[i].deaths));
        $("#counter_recovered").html(numberFormat(d[i].recovered));
    }
    if (country === "world" && d.confirmed_100k === undefined){
        data[country][i].confirmed_100k = data[country][i].confirmed / population.world * 100000;
        data[country][i].deaths_100k = data[country][i].deaths / population.world * 100000;
        d = data[country];
    }
    $("#counter_confirmed_100k").html((country === "world" ? "" : '<div class="rank_counter">' + d[i].rank_confirmed_100k + '&deg;</div>') + numberFormat(d[i].confirmed_100k));
    $("#counter_deaths_100k").html((country === "world" ? "" : '<div class="rank_counter">' + d[i].rank_deaths_100k + '&deg;</div>') + numberFormat(d[i].deaths_100k));
    $("#counter_fatality").html(numberFormat(((isNaN(d[i].deaths / (d[i].confirmed) * 100) ? 0 : d[i].deaths / (d[i].confirmed) * 100)).toFixed(1)) + "%");
    $("#slider-counters-date").html(beautifyDate(data.world[i].date));
}

function buildTable(i_slider) {
    i_slider = i_slider === undefined ? data.world.length - 1 : i_slider;
    var html = '';
    html += '<table id="main-table" class="table table-striped table-bordered table-condensed">';
    html += '   <thead>';
    html += '       <tr>';
    html += '           <th><lang for="country">' + lang.country + '</lang></th>';
    html += '           <th><i class="fas fa-clipboard-check"></i> <lang class="d-none d-sm-inline" for="confirmed">' + lang.confirmed + '</lang></th>';
    html += '           <th><i class="fas fa-skull"></i> <lang class="d-none d-sm-inline" for="deaths">' + lang.deaths + '</lang></th>';
    html += '           <th><i class="fas fa-shield-virus"></i> <lang class="d-none d-sm-inline" for="recovered">' + lang.recovered + '</lang></th>';
    html += '           <th><i class="fas fa-skull-crossbones"></i> <lang class="d-none d-sm-inline" for="fatality">' + lang.fatality + '</lang></th>';
    html += '           <th style="font-size: 10px; padding: 10px 0px;"><i class="fas fa-clipboard-check"></i> <lang class="" for="by_100k">' + lang.by_100k + '</lang></th>';
    html += '           <th style="font-size: 10px; padding: 10px 0px;"><i class="fas fa-skull"></i> <lang class="" for="by_100k">' + lang.by_100k + '</lang></th>';
    html += '       </tr>';
    html += '       <tbody>';

    for (var i = 0; i < Object.keys(data).length; i++) {
        var country = Object.keys(data)[i];
        if (country === "world") {
            continue;
        }
        var last_entry = data[country][i_slider];
        html += '       <tr>';
        html += '           <td>' + country + '</td>';
        html += '           <td class="text-center nowrap" data-order="' + last_entry.confirmed + '">' + last_entry.confirmed + ' <span class="position_rank">(' + last_entry.rank_confirmed + '&deg;)</span></td>';
        html += '           <td class="text-center nowrap" data-order="' + last_entry.deaths + '">' + last_entry.deaths + ' <span class="position_rank">(' + last_entry.rank_deaths + '&deg;)</span></td>';
        html += '           <td class="text-center">' + last_entry.recovered + '</td>';
        html += '           <td class="text-center nowrap" data-order="' + last_entry.fatality + '">' + (numberFormat(last_entry.fatality) + "%") + '</td>';
        html += '           <td class="text-center nowrap" data-order="' + last_entry.rank_confirmed_100k + '">' + (last_entry.confirmed_100k.toFixed(1)) + ' <span class="position_rank">(' + last_entry.rank_confirmed_100k + '&deg;)</span></td>';
        html += '           <td class="text-center nowrap" data-order="' + last_entry.rank_deaths_100k + '">' + (last_entry.deaths_100k.toFixed(1)) + ' <span class="position_rank">(' + last_entry.rank_deaths_100k + '&deg;)</span></td>';
        html += '       </tr>';
    }

    html += '       </tbody>';
    html += '   </thead>';
    html += '</table>';

    $("#wrapper-table").html(html);
    $("#main-table").DataTable({
        "bLengthChange": false,
        "bFilter": false,
        "bInfo": false,
        "iDisplayLength": 20,
        "order": [[1, "desc"]],
        "pagingType": "numbers"
    });
}

var data = false;
var current_lang = navigator.language.split("-")[0];
var lang = {};
if (current_lang === "pt") {
    lang = {
        country: "País",
        confirmed: "Confirmados",
        deaths: "Mortes",
        recovered: "Recuperados",
        fatality: "Fatalidade",
        all_world: "Mundo Todo",
        overall_growth: "Crescimento geral",
        months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        comparing_countries: "Comparar países",
        footer: "Feito por <a href='https://github.com/etcho'>Etcho</a> para a <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://github.com/pomber/covid19' target='_blank'>Fonte dos dados</a> e <a href='https://github.com/samayo/country-json' target='_blank'>população</a>.",
        world_map: "Mapa do Mundo",
        ranking: "Ranking",
        by_100k: "/ 100 mil hab."
    };
} else {
    lang = {
        country: "Country",
        confirmed: "Confirmed",
        deaths: "Deaths",
        recevered: "Recovered",
        fatality: "Fatality",
        all_world: "All World",
        overall_growth: "Overall growth",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        comparing_countries: "Compare countries",
        footer: "Made by <a href='https://github.com/etcho'>Etcho</a> for <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://github.com/pomber/covid19' target='_blank'>Data source</a> and <a href='https://github.com/samayo/country-json' target='_blank'>population</a>.",
        world_map: "World Map",
        ranking: "Ranking",
        by_100k: "By 100k inh."
    };
}

$(document).ready(function () {
    loadLang();

    $.ajax({
        url: "https://pomber.github.io/covid19/timeseries.json",
        dataType: "json",
        success: function (d) {
            data = d;
            var world = [];
            $("#country").append('<option value="world">' + lang.all_world + '</option>');
            $(Object.keys(data)).each(function (a, b) {
                $("#country").append('<option value="' + b + '">' + b + '</option>');
                $(data[b]).each(function (c, d) {
                    data[b][c]["confirmed_100k"] = d.confirmed / population[b] * 100000;
                    data[b][c]["deaths_100k"] = d.deaths / population[b] * 100000;
                    data[b][c]["fatality"] = ((isNaN(d.deaths / (d.confirmed) * 100) ? 0 : d.deaths / (d.confirmed) * 100)).toFixed(1);
                    data[b][c]["rank_confirmed"] = 1;
                    data[b][c]["rank_confirmed_100k"] = 1;
                    data[b][c]["rank_deaths"] = 1;
                    data[b][c]["rank_deaths_100k"] = 1;
                    data[b][c]["rank_fatality"] = 1;
                    var found = false;
                    $(world).each(function (e, f) {
                        if (f.date === d.date) {
                            world[e].confirmed += d.confirmed;
                            world[e].deaths += d.deaths;
                            world[e].recovered += d.recovered;
                            found = true;
                        }
                    });
                    if (!found) {
                        world.push({date: d.date, confirmed: d.confirmed, deaths: d.deaths, recovered: d.recovered});
                    }
                });
            });

            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++) {
                var country = keys[i];
                for (var j = 0; j < data[country].length; j++) {
                    for (var k = 0; k < keys.length; k++) {
                        var country2 = keys[k];
                        if (data[country][j].confirmed < data[country2][j].confirmed) {
                            data[country][j].rank_confirmed++;
                        }
                        if (data[country][j].deaths < data[country2][j].deaths) {
                            data[country][j].rank_deaths++;
                        }
                        if (data[country][j].confirmed_100k < data[country2][j].confirmed_100k) {
                            data[country][j].rank_confirmed_100k++;
                        }
                        if (data[country][j].deaths_100k < data[country2][j].deaths_100k) {
                            data[country][j].rank_deaths_100k++;
                        }
                    }

                }
            }

            data.world = world;
            if (hash().length > 0) {
                $("#country option").each(function () {
                    if ($(this).attr("value").toLowerCase() === hash().toLowerCase()) {
                        $(this).prop("selected", true);
                    }
                });
            }
            $("select").show().select2().trigger("change");
            $(".loading").not(".dontgo").hide();

            $("#slider-counters").attr("data-slider-max", data.world.length - 1).attr("data-slider-value", data.world.length - 1);
            $("#slider-counters").slider();
            $("#slider-counters").on("change", function (slideEvt) {
                updateCounters($("#country").select2("val"), slideEvt.value.newValue);
                buildMapChart(slideEvt.value.newValue);
                buildTable(slideEvt.value.newValue);
            });
        }
    });

    $("#country").on("change", function () {
        var country = $(this).select2("val");
        updateCounters(country);
        jump(country);
        buildCharts();
        buildChartCompare();
        buildTable();
    });

    $("img.flag").on("click", function () {
        if (!$(this).hasClass("active") || $("img.flag.active").length > 1) {
            $(this).toggleClass("active");
            buildChartCompare();
        }
    });

    $("#map-buttons-world-map .btn").on("click", function () {
        $("#map-buttons-world-map .btn").removeClass("btn-warning").addClass("btn-secondary");
        $(this).addClass("btn-warning");
        buildMapChart($("#slider-counters").val());
    });

    google.charts.load('current', {
        'packages': ['geochart'],
        'mapsApiKey': 'AIzaSyD4quPRnwLcqC9R6iaHl4ffAGJeAybt7Yg'
    });

    google.charts.setOnLoadCallback(buildMapChart);
});