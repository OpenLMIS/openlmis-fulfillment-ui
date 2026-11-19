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

import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import TransferRequestPage from './transfer-request-page';

(function () {
    'use strict';

    angular
        .module('transfer-request')
        .directive('transferRequestPage', transferRequestPage);

    transferRequestPage.$inject = [];

    function transferRequestPage() {
        return {
            template: '<div id="transferRequestPage" class="transfer-request-page"></div>',
            replace: true,
            link: function () {
                const app = document.getElementById('transferRequestPage');

                ReactDOM.render(
                    <>
                        <TransferRequestPage />
                        <ToastContainer theme="colored" />
                    </>,
                    app
                );
            }
        };
    }
})();
