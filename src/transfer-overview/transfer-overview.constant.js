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
     * @ngdoc object
     * @name transfer-overview.TRANSFER_OVERVIEW
     *
     * @description
     * The tabs and status filters of the Transfers page. Incoming stock is requested by, or reallocated
     * to, the home facility; outgoing stock is requested from, or reallocated by, it.
     */
    angular
        .module('transfer-overview')
        .constant('TRANSFER_OVERVIEW', {
            INCOMING: 'incoming',
            OUTGOING: 'outgoing',
            STATUS_OPEN: 'OPEN',
            STATUS_ALL: 'ALL',
            STATUS_CREATING: 'CREATING',
            STATUSES: ['CREATING', 'ORDERED', 'FULFILLING', 'SHIPPED', 'RECEIVED', 'CANCELLED']
        });

})();
