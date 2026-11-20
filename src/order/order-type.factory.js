/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name order.orderTypeFactory
     *
     * @description
     * Order type options and the default type filter of the order lists. Without SHOW_TRANSFERS the
     * lists don't filter by type at all.
     */
    angular
        .module('order')
        .factory('orderTypeFactory', factory);

    factory.$inject = ['messageService', 'ORDER_TYPE', 'SHOW_TRANSFERS'];

    function factory(messageService, ORDER_TYPE, SHOW_TRANSFERS) {
        var DEFAULT_ORDER_TYPES = [ORDER_TYPE.REQUISITION, ORDER_TYPE.REQUISITION_LESS];

        return {
            getAll: getAll,
            isEnabled: isEnabled,
            applyDefault: applyDefault
        };

        /**
         * @ngdoc method
         * @methodOf order.orderTypeFactory
         * @name getAll
         *
         * @return {Array} the order types as select options
         */
        function getAll() {
            return Object.keys(ORDER_TYPE).map(function(type) {
                return {
                    name: messageService.get('orderType.' + type),
                    value: ORDER_TYPE[type]
                };
            });
        }

        /**
         * @ngdoc method
         * @methodOf order.orderTypeFactory
         * @name isEnabled
         *
         * @return {boolean} true if the order lists show and filter by type
         */
        function isEnabled() {
            return SHOW_TRANSFERS;
        }

        /**
         * @ngdoc method
         * @methodOf order.orderTypeFactory
         * @name applyDefault
         *
         * @description
         * Returns a copy of the search params with the type filter applied: the chosen type, else the
         * requisition and requisition-less types. Without SHOW_TRANSFERS any type is removed.
         *
         * @param  {Object} params the order search params
         * @return {Object}        the search params to send
         */
        function applyDefault(params) {
            var result = angular.copy(params);

            if (!SHOW_TRANSFERS) {
                delete result.type;
            } else if (!result.type) {
                result.type = angular.copy(DEFAULT_ORDER_TYPES);
            }

            return result;
        }
    }

})();
