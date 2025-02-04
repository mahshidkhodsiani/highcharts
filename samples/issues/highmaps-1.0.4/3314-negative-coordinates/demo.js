$(function () {

    // Prepare random data
    var data = [{
        code: "12Y",
        value: 728
    }, {
        code: "10Y",
        value: 541
    }];

    var geojson = {
        type: "FeatureCollection",
        crs: {
            type: "name",
            properties: {
                name: "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },

        features: [{
            type: "Feature",
            properties: {
                CP_BEAT: "12Y",
                POL_BEAT: "12",
                POL_DIST: "2",
                POL_SECT: "1",
                ID: 53,
                FULLNAME: null,
                ACTION: "P",
                AGENCY: "OP",
                RESPONSE: null,
                MESSAGE: 0.0,
                NAME: "12Y",
                SOURCETHM: "Pb",
                ACRES: 431.053,
                RULEID: 2,
                RULEID_1: 0,
                SHAPE_AREA: 29298982.3469,
                SHAPE_LEN: 29524.361276399999042
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-122.253567715369499, 37.850819709676422],
                        [-122.250901591213591, 37.851610510152703],
                        [-122.23457297197875, 37.852553432954416],
                        [-122.233805479134773, 37.852239223607896],
                        [-122.232492458131375, 37.850464176119083],
                        [-122.229525995559442, 37.848554050081944],
                        [-122.23483911920961, 37.848157435299527],
                        [-122.239001249417768, 37.849643293841631],
                        [-122.243376814524197, 37.848042598395224],
                        [-122.244696731486783, 37.846796654497226],
                        [-122.252344172217477, 37.834439540572113],
                        [-122.257058692340181, 37.836453553051115],
                        [-122.26229539617205, 37.83725580015382],
                        [-122.260130843043456, 37.852958532406561],
                        [-122.253772359458196, 37.853766672964099],
                        [-122.253200312320175, 37.85140195408745],
                        [-122.253567715369499, 37.850819709676422]
                    ]
                ]
            }
        }, {
            type: "Feature",
            properties: {
                CP_BEAT: "10Y",
                POL_BEAT: "10",
                POL_DIST: "2",
                POL_SECT: "1",
                ID: 40,
                FULLNAME: null,
                ACTION: "P",
                AGENCY: "OP",
                RESPONSE: null,
                MESSAGE: 0.0,
                NAME: "10Y",
                SOURCETHM: "Pb",
                ACRES: 277.952,
                RULEID: 2,
                RULEID_1: 0,
                SHAPE_AREA: 12112098.0136,
                SHAPE_LEN: 16726.632870500001445
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-122.268088702101338, 37.836847065503278],
                        [-122.266099940295945, 37.835215040352146],
                        [-122.267235329879981, 37.829590449906135],
                        [-122.277867457627224, 37.831268319069814],
                        [-122.274377103287904, 37.841503253051762],
                        [-122.275371818424091, 37.846010027752179],
                        [-122.271010336186862, 37.846584816415799],
                        [-122.269342083071137, 37.838937130779215],
                        [-122.268088702101338, 37.836847065503278]
                    ]
                ]
            }
        }]
    };


    // Initialize the chart
    $('#container').highcharts('Map', {

        title: {
            text: 'Negative coordinats failed'
        },


        series: [{
            data: data,
            mapData: geojson,
            joinBy: ['CP_BEAT', 'code'],
            name: 'Random data',
            states: {
                hover: {
                    color: '#a4edba'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.properties.CP_BEAT}'
            }
        }]
    });
});