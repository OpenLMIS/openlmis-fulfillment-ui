6.1.7-SNAPSHOT / WIP
==================
Improvements:
* [OE-96](https://openlmis.atlassian.net/browse/OE-96): Removed unnecessary files from the moved quantity-unit-toggle component

6.1.6 / 2025-03-31
==================

6.1.5 / 2024-10-31
==================
Bug fixes:
* [OLMIS-7375](https://openlmis.atlassian.net/browse/OLMIS-7375): Fixed search input overlaping with the table when no supplying facility was selected.
* [OLMIS-6917](https://openlmis.atlassian.net/browse/OLMIS-6917): Disabled autoselect for supplying facility.
Improvements:
* [OIS-24](https://openlmis.atlassian.net/browse/OIS-24): Adjusted all components styles to support RTL

6.1.4 / 2023-11-07
==================

6.1.3 / 2023-06-26
==================
Bug fixes:
* [OLMIS-7772](https://openlmis.atlassian.net/browse/OLMIS-7772): Fix issues with new Chrome popover functionality

6.1.2 / 2023-04-05
==================

6.1.1 / 2022-04-21
==================

Bug fixes:
* [OLMIS-7520](https://openlmis.atlassian.net/browse/OLMIS-7520): Basic order factory can build order with empty processingPeriod

New features:
* [OLMIS-7519](https://openlmis.atlassian.net/browse/OLMIS-7519): Add Requistion-less Orders to "View Orders" page

6.1.0 / 2021-10-28
==================

Improvements:
* [OLMIS-7314](https://openlmis.atlassian.net/browse/OLMIS-7314): Update scss files to enable webpack build.

6.0.9 / 2021-05-27
==================

Bug fixes:
* [OLMIS-6629](https://openlmis.atlassian.net/browse/OLMIS-6629): Made Fill Quantity marked in red when it is higher than Available SOH value.
* [OLMIS-5511](https://openlmis.atlassian.net/browse/OLMIS-5511): sorting requesting and supplying facilities in asc order

Improvements:
* Updated dev-ui version to 9.0.2.
* Updated ui-components version to 7.2.5.
* Updated auth-ui version to 6.2.6.
* Updated ui-layout version to 5.1.9.
* Updated stockmanagement-ui version to 2.0.9.
* Updated referencedata-ui version to 5.6.5.
* Updated cce-ui version to 1.0.9.

6.0.8 / 2020-11-17
==================

Bug fixes:
* [COV-67](https://openlmis.atlassian.net/browse/COV-67): Made Order Quantity values visible on Shipment Screens for orderables with no identifiers.

Improvements:
* Updated ui-components version to 7.2.4.
* Updated auth-ui version to 6.2.5.
* Updated ui-layout version to 5.1.8.
* Updated referencedata-ui version to 5.6.4.
* Updated stockmanagement-ui version to 2.0.8.
* Updated cce-ui version to 1.0.8.

6.0.7 / 2020-05-12
==================

Improvements:
* Updated ui-components version to 7.2.3.
* Updated auth-ui version to 6.2.4.
* Updated ui-layout version to 5.1.7.
* Updated referencedata-ui version to 5.6.3.
* Updated stockmanagement-ui version to 2.0.7.
* Updated cce-ui version to 1.0.7.

6.0.6 / 2020-04-14
==================

Improvements:
* Updated ui-components version to 7.2.2.
* Updated auth-ui version to 6.2.3.
* Updated ui-layout version to 5.1.6.
* Updated referencedata-ui version to 5.6.2.
* Updated stockmanagement-ui version to 2.0.6.
* Updated cce-ui version to 1.0.6.

6.0.5 / 2019-12-19
==================

Improvements:
* Updated ui-components version to 7.2.1.
* Updated auth-ui version to 6.2.2.
* Updated ui-layout version to 5.1.5.
* Updated referencedata-ui version to 5.6.1.
* Updated stockmanagement-ui version to 2.0.5.
* Updated cce-ui version to 1.0.5.

6.0.4 / 2019-10-17
==================

Improvements:
* Updated dev-ui version to 9.0.1.
* Updated ui-components version to 7.2.0.
* Updated auth-ui version to 6.2.1.
* Updated ui-layout version to 5.1.4.
* Updated referencedata-ui version to 5.6.0.
* Updated stockmanagement-ui version to 2.0.4.
* Updated cce-ui version to 1.0.4.

6.0.3 / 2019-05-27
==================

New functionality added in a backwards-compatible manner:
* [OLMIS-6392](https://openlmis.atlassian.net/browse/OLMIS-6392): Adjusted shipment line item to use orderable versioning.

Bug fixes:
* [OLMIS-5818](https://openlmis.atlassian.net/browse/OLMIS-5818): Fixed a bug with the selected status not being shown on the View Orders page.
* [OLMIS-6330](https://openlmis.atlassian.net/browse/OLMIS-6330): fixed trigerring reference-ui build.
* [OLMIS-6488](https://openlmis.atlassian.net/browse/OLMIS-6488): Removed redundant OrderableResource file.

6.0.2 / 2018-12-12
==================

Improvements:
* [OLMIS-5409](https://openlmis.atlassian.net/browse/OLMIS-5409): Updated ui-components to version 7.0.0.
* [OLMIS-3696](https://openlmis.atlassian.net/browse/OLMIS-3696): Added dependency and development dependency locking.

Bug fixes:
* [OLMIS-5249](https://openlmis.atlassian.net/browse/OLMIS-5249): Fixed typo on the Manage Proof of Delivery screen.
* [OLMIS-5224](https://openlmis.atlassian.net/browse/OLMIS-5224): Fixed a bug with printing Proof of Delivery.
* [OLMIS-5486](https://openlmis.atlassian.net/browse/OLMIS-5486): Fixed a bug with printing Proof of Delivery with the initiated status.

6.0.1 / 2018-08-16
==================
New functionality added in a backwards-compatible manner:
* [OLMIS-4867](https://openlmis.atlassian.net/browse/OLMIS-4867): A new button added to retry uploading orders to FTP.
* [OLMIS-4868](https://openlmis.atlassian.net/browse/OLMIS-4868): Added a new dropdown to allow orders to be filtered by order status on view orders page.

Improvements:
* [OLMIS-4722](https://openlmis.atlassian.net/browse/OLMIS-4722): Change primary button from "Print" to "Manage" on POD list screen.
* [OLMIS-4739](https://openlmis.atlassian.net/browse/OLMIS-4739): Added Jenkinsfile.
* [OLMIS-4795](https://openlmis.atlassian.net/browse/OLMIS-4795): Updated dev-ui to version 8.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated datepickers to use the new syntax.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated ui-components to version 6.0.0.

Bug fixes:
* [OLMIS-5173](https://openlmis.atlassian.net/browse/OLMIS-5173): Fixed broken Print button on the View Proof of Delivery screen.
* [OLMIS-5159](https://openlmis.atlassian.net/browse/OLMIS-5159): Fixed blank order quantity on Shipment view for products for which requested quantity was 0.

6.0.0 / 2018-04-24
==================

Breaking changes:
* [OLMIS-3995](https://openlmis.atlassian.net/browse/OLMIS-3995): Reworked View Proof of Delivery screen.

New functionality added in a backwards-compatible manner:
* [OLMIS-3610](https://openlmis.atlassian.net/browse/OLMIS-3610): Added saving for shipment draft.
* [OLMIS-3108](https://openlmis.atlassian.net/browse/OLMIS-3108): Updated to use dev-ui v7 transifex build process
* [OLMIS-3607](https://openlmis.atlassian.net/browse/OLMIS-3607): Added created date and last updated columns to the Order list view
* [OLMIS-3608](https://openlmis.atlassian.net/browse/OLMIS-3608): Created basic order details view
* [OLMIS-3382](https://openlmis.atlassian.net/browse/OLMIS-3382): Use CCE status component in order details view
* [OLMIS-3614](https://openlmis.atlassian.net/browse/OLMIS-3614): Added stock columns on Order details page.
* [OLMIS-239](https://openlmis.atlassian.net/browse/OLMIS-239): Added print button to shipment page.
* [OLMIS-1611](https://openlmis.atlassian.net/browse/OLMIS-1611): Added confirm shipment button.
* [OLMIS-529](https://openlmis.atlassian.net/browse/OLMIS-529): Show lots in recommended sort order on fulfill view.
* [OLMIS-685](https://openlmis.atlassian.net/browse/OLMIS-685): Added the ability to provide rejection reason for stock.
* [OLMIS-3826](https://openlmis.atlassian.net/browse/OLMIS-3826): Added Fulfill Orders screen.
* [OLMIS-4014](https://openlmis.atlassian.net/browse/OLMIS-4014): Added VVM status column on POD view screen.
* [OLMIS-4001](https://openlmis.atlassian.net/browse/OLMIS-4001): Added print button on Manage and View PoD screens.

Improvements:
* [OLMIS-4077](https://openlmis.atlassian.net/browse/OLMIS-4077): Rearranged fulfillment view header.
* [OLMIS-3876](https://openlmis.atlassian.net/browse/OLMIS-3876): Split navigation and filter forms in manage POD and orders pages
* [OLMIS-3955](https://openlmis.atlassian.net/browse/OLMIS-3955): Renamed PICKING order status to FULFILLING. Removed PICKED and IN_TRANSIT.
* [OLMIS-3954](https://openlmis.atlassian.net/browse/OLMIS-3954): Added hiding Fulfill button for orders with status different than FULFILLING and ORDERED. Updated UI to create shipment draft after clicking Fulfill button.
* [OLMIS-3993](https://openlmis.atlassian.net/browse/OLMIS-3993): Updated labels and columns on Manage PoDs screen.
* [OLMIS-4165](https://openlmis.atlassian.net/browse/OLMIS-4165): Changed Order search endpoint and renamed its parameters.
* [OLMIS-4119](https://openlmis.atlassian.net/browse/OLMIS-4119): Renamed POD endpoint.
* [OLMIS-892](https://openlmis.atlassian.net/browse/OLMIS-892): Show Ordered Quantity on the Proof of Delivery view
* [OLMIS-4078](https://openlmis.atlassian.net/browse/OLMIS-4078): All buttons except "Delete Shipment" no longer appears if no matching stock cards.
* [OLMIS-4266](https://openlmis.atlassian.net/browse/OLMIS-4266): Use expand pattern for proofs of delivery.
* [OLMIS-4137](https://openlmis.atlassian.net/browse/OLMIS-4137): Added supplying facility dropdown on the Manage PoD screen and disabled editing PoD when user has no permission.
* [OLMIS-4262](https://openlmis.atlassian.net/browse/OLMIS-4262): Use new orderId parameter of GET /proofsOfDelivery
* [OLMIS-4118](https://openlmis.atlassian.net/browse/OLMIS-4118): Show display unit for Dispensable
* [OLMIS-4326](https://openlmis.atlassian.net/browse/OLMIS-4326): Added grouping by commodity types and trade items for View Proof of Delivery screen.

Bug fixes:
* [OLMIS-4391](https://openlmis.atlassian.net/browse/OLMIS-4391): Removed default order statuses from the url on the Order Fulfill

5.1.0 / 2017-11-09
==================

New functionality added in a backwards-compatible manner:
* [OLMIS-3222](https://openlmis.atlassian.net/browse/OLMIS-3222): Added period start and end dates parameters to the order view screen

Bug fixes:
* [OLMIS-3159](https://openlmis.atlassian.net/browse/OLMIS-3159): Fixed facility select loosing state no POD manage page.
* [OLMIS-3285](https://openlmis.atlassian.net/browse/OLMIS-3285): Fixed broken pagination on Manage Proofs of Delivery page.
* [OLMIS-3540](https://openlmis.atlassian.net/browse/OLMIS-3540): Now Manage POD displays items with IN_ROUTE status.

Improvements:
* Updated dev-ui version to 6.
* [OLMIS-3448](https://openlmis.atlassian.net/browse/OLMIS-3448): Preserve the order of facilities in the dropdown on Order View.

5.0.3 / 2017-09-01
==================

Bug fixes

* [OLMIS-2837](https://openlmis.atlassian.net/browse/OLMIS-2837): Fixed filtering on the manage POD page.
* [OLMIS-2724](https://openlmis.atlassian.net/browse/OLMIS-2724): Fixed broken requesting facility filter select on Order View.

5.0.2 / 2017-06-22
==================

Bug fixes

* [OLMIS-2567](https://openlmis.atlassian.net/browse/OLMIS-2567): Incorperated openlmis-facility-program-select.
* [OLMIS-2532](https://openlmis.atlassian.net/browse/OLMIS-2532): Fixed manage PODs view always displayed the previously facility.

5.0.1 / 2017-05-26
==================

Bug fixes

* [OLMIS-2445](https://openlmis.atlassian.net/browse/OLMIS-2445): Button and title capitalization are consistent.
* [OLMIS-2488](https://openlmis.atlassian.net/browse/OLMIS-2488): Fixed proof of Delivery screen action button text was not translated.
* View Orders screen will now only require either ORDERS_VIER or PODS_MANAGE right to enter(https://github.com/OpenLMIS/openlmis-fulfillment-ui/pull/1).

5.0.0 / 2017-05-08
==================

Compatibility breaking changes:
* [OLMIS-2107](https://openlmis.atlassian.net/browse/OLMIS-2107): Add breadcrumbs to top of page navigation
  * All states have been modified to be descendants of the main state.

Bug fixes and performance improvements which are backwards-compatible:

* [OLMIS-2355](https://openlmis.atlassian.net/browse/OLMIS-2355): Inncorect working sticky columns - large gap in tables
* [OLMIS-2204](https://openlmis.atlassian.net/browse/OLMIS-2204): The administration menu item should always be the last menu item
  * Priority of all fulfillment screens have been changed to 0.

Dev and tooling updates made in a backwards-compatible manner:

* [OLMIS-1853](https://openlmis.atlassian.net/browse/OLMIS-1853): Separate push and pull Transifex tasks in build
  * Migrated to dev-ui 3.
* [OLMIS-1609](https://openlmis.atlassian.net/browse/OLMIS-1609): UI i18N message strings are not standardized
* [OLMIS-2204](https://openlmis.atlassian.net/browse/OLMIS-2204): The administration menu item should always be the last menu item
