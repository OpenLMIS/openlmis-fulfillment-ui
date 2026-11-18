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

describe('SHOW_TRANSFERS', function() {

    beforeEach(function() {
        module('transfer');

        inject(function($injector) {
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
        });
    });

    it('should be off unless the build sets showTransfers to true', function() {
        expect(this.SHOW_TRANSFERS).toBe(false);
    });

});
