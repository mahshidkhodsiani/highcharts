/* *
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type CSSObject from '../../Core/Renderer/CSSObject';
import type IndicatorValuesObject from './IndicatorValuesObject';
import type LineSeries from '../../Series/Line/LineSeries';
import type { PointMarkerOptions } from '../../Core/Series/PointOptions';
import type {
    SMAOptions,
    SMAParamsOptions
} from './SMA/SMAOptions';
import type SMAPoint from './SMA/SMAPoint';
import BaseSeries from '../../Core/Series/Series.js';
const {
    seriesTypes: {
        sma: SMAIndicator
    }
} = BaseSeries;
import MultipleLinesMixin from '../../Mixins/MultipleLines.js';
import ReduceArrayMixin from '../../Mixins/ReduceArray.js';
import U from '../../Core/Utilities.js';
const {
    extend,
    isArray,
    merge
} = U;

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {

        interface StochasticIndicatorParamsOptions
            extends SMAParamsOptions {
            periods?: Array<number>;
        }

        class StochasticIndicatorPoint extends SMAPoint {
            public series: StochasticIndicator;
        }

        interface StochasticIndicatorOptions
            extends SMAOptions, MultipleLinesIndicatorOptions {
            dataGrouping?: DataGroupingOptionsObject;
            marker?: PointMarkerOptions;
            params?: StochasticIndicatorParamsOptions;
            smoothedLine?: Record<string, CSSObject>;
            tooltip?: TooltipOptions;
        }
    }
}

/**
 * The Stochastic series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.stochastic
 *
 * @augments Highcharts.Series
 */
class StochasticIndicator extends SMAIndicator {
    /**
     * Stochastic oscillator. This series requires the `linkedTo` option to be
     * set and should be loaded after the `stock/indicators/indicators.js` file.
     *
     * @sample stock/indicators/stochastic
     *         Stochastic oscillator
     *
     * @extends      plotOptions.sma
     * @since        6.0.0
     * @product      highstock
     * @excluding    allAreas, colorAxis, joinBy, keys, navigatorOptions,
     *               pointInterval, pointIntervalUnit, pointPlacement,
     *               pointRange, pointStart, showInNavigator, stacking
     * @requires     stock/indicators/indicators
     * @requires     stock/indicators/stochastic
     * @optionparent plotOptions.stochastic
     */
    public static defaultOptions: Highcharts.StochasticIndicatorOptions = merge(SMAIndicator.defaultOptions, {
        /**
         * @excluding index, period
         */
        params: {
            /**
             * Periods for Stochastic oscillator: [%K, %D].
             *
             * @type    {Array<number,number>}
             * @default [14, 3]
             */
            periods: [14, 3]
        },
        marker: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<span style="color:{point.color}">\u25CF</span><b> {series.name}</b><br/>%K: {point.y}<br/>%D: {point.smoothed}<br/>'
        },
        /**
         * Smoothed line options.
         */
        smoothedLine: {
            /**
             * Styles for a smoothed line.
             */
            styles: {
                /**
                 * Pixel width of the line.
                 */
                lineWidth: 1,
                /**
                 * Color of the line. If not set, it's inherited from
                 * [plotOptions.stochastic.color
                 * ](#plotOptions.stochastic.color).
                 *
                 * @type {Highcharts.ColorString}
                 */
                lineColor: void 0
            }
        },
        dataGrouping: {
            approximation: 'averages'
        }
    } as Highcharts.StochasticIndicatorOptions)
}

interface StochasticIndicator {
    data: Array<Highcharts.StochasticIndicatorPoint>;
    getTranslatedLinesNames: Highcharts.MultipleLinesMixin[
        'getTranslatedLinesNames'
    ];
    getValues<TLinkedSeries extends LineSeries>(
        series: TLinkedSeries,
        params: Highcharts.StochasticIndicatorParamsOptions
    ): (IndicatorValuesObject<TLinkedSeries>|undefined);
    init(): void;
    linesApiNames: Array<string>;
    nameBase: string;
    nameComponents: Array<string>;
    options: Highcharts.StochasticIndicatorOptions;
    parallelArrays: Array<string>;
    pointArrayMap: Array<string>;
    pointClass: typeof Highcharts.StochasticIndicatorPoint;
    points: Array<Highcharts.StochasticIndicatorPoint>;
    pointValKey: string;
}

extend(StochasticIndicator.prototype, {
    nameComponents: ['periods'],
    nameBase: 'Stochastic',
    pointArrayMap: ['y', 'smoothed'],
    parallelArrays: ['x', 'y', 'smoothed'],
    pointValKey: 'y',
    linesApiNames: ['smoothedLine'],
    init: function (this: StochasticIndicator): void {
        BaseSeries.seriesTypes.sma.prototype.init.apply(this, arguments);

        // Set default color for lines:
        this.options = merge({
            smoothedLine: {
                styles: {
                    lineColor: this.color
                }
            }
        }, this.options);
    },
    getValues: function<TLinkedSeries extends LineSeries> (
        this: StochasticIndicator,
        series: TLinkedSeries,
        params: Highcharts.StochasticIndicatorParamsOptions
    ): (IndicatorValuesObject<TLinkedSeries>|undefined) {
        var periodK: number = (params.periods as any)[0],
            periodD: number = (params.periods as any)[1],
            xVal: Array<number> = (series.xData as any),
            yVal: Array<Array<number>> = (series.yData as any),
            yValLen: number = yVal ? yVal.length : 0,
            // 0- date, 1-%K, 2-%D
            SO: Array<Array<(number|null)>> = [],
            xData: Array<number> = [],
            yData: Array<Array<(number|null)>> = [],
            slicedY: Array<Array<number>>,
            close = 3,
            low = 2,
            high = 1,
            CL: number,
            HL: number,
            LL: number,
            K: number,
            D: number|null = null,
            points: (
                IndicatorValuesObject<LineSeries>|
                undefined
            ),
            extremes: [number, number],
            i: number;


        // Stochastic requires close value
        if (
            yValLen < periodK ||
            !isArray(yVal[0]) ||
            yVal[0].length !== 4
        ) {
            return;
        }

        // For a N-period, we start from N-1 point, to calculate Nth point
        // That is why we later need to comprehend slice() elements list
        // with (+1)
        for (i = periodK - 1; i < yValLen; i++) {
            slicedY = yVal.slice(i - periodK + 1, i + 1);

            // Calculate %K
            extremes = ReduceArrayMixin.getArrayExtremes(slicedY, low as any, high as any);
            LL = extremes[0]; // Lowest low in %K periods
            CL = yVal[i][close] - LL;
            HL = extremes[1] - LL;
            K = CL / HL * 100;

            xData.push(xVal[i]);
            yData.push([K, null]);

            // Calculate smoothed %D, which is SMA of %K
            if (i >= (periodK - 1) + (periodD - 1)) {
                points = BaseSeries.seriesTypes.sma.prototype.getValues.call(this, ({
                    xData: xData.slice(-periodD),
                    yData: yData.slice(-periodD)
                } as any), {
                    period: periodD
                });
                D = (points as any).yData[0];
            }

            SO.push([xVal[i], K, D]);
            yData[yData.length - 1][1] = D;
        }

        return {
            values: SO,
            xData: xData,
            yData: yData
        } as IndicatorValuesObject<TLinkedSeries>;
    }
});

declare module '../../Core/Series/SeriesType' {
    interface SeriesTypeRegistry {
        stochastic: typeof StochasticIndicator;
    }
}

BaseSeries.registerSeriesType('stochastic', StochasticIndicator);

/* *
 *
 *  Default Export
 *
 * */

export default StochasticIndicator;

/**
 * A Stochastic indicator. If the [type](#series.stochastic.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.stochastic
 * @since     6.0.0
 * @product   highstock
 * @excluding allAreas, colorAxis,  dataParser, dataURL, joinBy, keys,
 *            navigatorOptions, pointInterval, pointIntervalUnit,
 *            pointPlacement, pointRange, pointStart, showInNavigator, stacking
 * @requires  stock/indicators/indicators
 * @requires  stock/indicators/stochastic
 * @apioption series.stochastic
 */

''; // to include the above in the js output
