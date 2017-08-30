const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';
// const BASE_CONFIG_URL = '//raw.githubusercontent.com/rbrtmrtn/mapboard-base-config/develop/config.js';
const BASE_CONFIG_URL = '//rawgit.com/rbrtmrtn/mapboard-base-config/cabbd47a580c15bc58b1944d21abc47009c4aba3/config.js';

const ZONING_CODE_MAP = {
  'RSD-1': 'Residential Single Family Detached-1',
  'RSD-2': 'Residential Single Family Detached-2',
  'RSD-3': 'Residential Single Family Detached-3',
  'RSA-1': 'Residential Single Family Attached-1',
  'RSA-2': 'Residential Single Family Attached-2',
  'RSA-3': 'Residential Single Family Attached-3',
  'RSA-4': 'Residential Single Family Attached-4',
  'RSA-5': 'Residential Single Family Attached-5',
  'RTA-1': 'Residential Two-Family Attached-1',
  'RM-1': 'Residential Multi-Family-1',
  'RM-2': 'Residential Multi-Family-2',
  'RM-3': 'Residential Multi-Family-3',
  'RM-4': 'Residential Multi-Family-4',
  'RMX-1': 'Residential Mixed-Use-1',
  'RMX-2': 'Residential Mixed-Use-2',
  'RMX-3': 'Residential (Center City) Mixed-Use-3',
  'CA-1': 'Auto-Oriented Commercial-1',
  'CA-2': 'Auto-Oriented Commercial-2',
  'CMX-1': 'Neighborhood Commercial Mixed-Use-1',
  'CMX-2': 'Neighborhood Commercial Mixed-Use-2',
  'CMX-2.5': 'Neighborhood Commercial Mixed-Use-2.5',
  'CMX-3': 'Community Commercial Mixed-Use',
  'CMX-4': 'Center City Commercial Mixed-Use',
  'CMX-5': 'Center City Core Commercial Mixed-Use',
  'I-1': 'Light Industrial',
  'I-2': 'Medium Industrial',
  'I-3': 'Heavy Industrial',
  'IP': 'Port Industrial',
  'ICMX': 'Industrial Commercial Mixed-Use',
  'IRMX': 'Industrial Residential Mixed-Use',
  'SPENT': 'Commercial Entertainment (Casinos)',
  'SPAIR': 'Airport',
  'SPINS': 'Institutional Development',
  'SPSTA': 'Stadium',
  'SPPOA': 'Recreation',
  'SPPOP': 'Recreation',
};

function cleanDorAttribute(attr) {
  // trim leading and trailing whitespace
  let cleanAttr = attr ? String(attr) : '';
  cleanAttr = cleanAttr.replace(/\s+/g, '');

  // return null for zeros and empty strings
  if (['', '0'].indexOf(cleanAttr) > -1) {
    return null;
  }

  return cleanAttr;
}

// TODO put this in base config transforms
function concatDorAddress(parcel, includeUnit = true) {
  const STREET_FIELDS = ['STDIR', 'STNAM', 'STDES', 'STDESSUF'];
  const props = parcel.properties;

  // handle house num
  const addressLow = cleanDorAttribute(props.HOUSE);
  const addressHigh = cleanDorAttribute(props.STEX);
  const addressSuffix = cleanDorAttribute(props.SUFFIX);
  let address = addressLow;
  address = address + (addressHigh ? '-' + addressHigh : '');
  address = address + (addressSuffix || '');

  // handle unit
  let unit = cleanDorAttribute(props.UNIT);
  if (unit) unit += '# ' + unit;

  // clean up attributes
  let comps = STREET_FIELDS.map(streetField => props[streetField]);
  comps = comps.map(cleanDorAttribute);
      // TODO handle individual address comps (like mapping stex=2 => 1/2)
      // addressLow = comps.HOUSE,
      // addressHigh = comps.STEX,
      // streetPredir = comps.STDIR,
      // streetName = comps.STNAM,
      // streetSuffix = comps.STDES,
      // streetPostdir = comps.STDESSUF,

  // add address to front
  comps = [address].concat(comps);

  // add unit to end
  if (includeUnit) comps = comps.concat([unit]);

  // remove nulls and concat
  address = comps.filter(Boolean).join(' ');

  return address;
}

function getVacancyText(state) {
  const land = state.sources.vacantLand.data
  const building = state.sources.vacantBuilding.data
  if (land.length === 0 && building.length === 0) {
    return 'Not Likely Vacant'
  } else if (land.length > 0) {
    return 'Likely Vacant Land'
  } else if (building.length > 0) {
    return 'Likely Vacant Building'
  }
}

// configure accounting.js
accounting.settings.currency.precision = 0;

Mapboard.default({
  // DEV
  // defaultAddress: '1234 MARKET ST',
  router: {
    enabled: true
  },
  rootStyle: {
    position: 'absolute',
    bottom: 0,
    top: '87px',
    left: 0,
    right: 0,
  },
  map: {
    // possibly should move to base config
    defaultBasemap: 'pwd',
    defaultIdentifyFeature: 'address-marker',
    imagery: {
      enabled: true
    },
    historicBasemaps: {
      enabled: true
    },
  },
  baseConfig: BASE_CONFIG_URL,
  dataSources: {
    // nearby: {
    //   type: 'http-get',
    //   url: 'https://phl.carto.com/api/v2/sql',
    //   options: {
    //     params: {
    //       q: function(feature) {
    //         const aisX = feature.geometry.coordinates[0];
    //         const aisY = feature.geometry.coordinates[1];
    //         const table = 'incidents_part1_part2';
    //         const distanceFn = "ST_Distance(the_geom_webmercator, ST_Transform(CDB_LatLng(" + aisY + ", " + aisX + "), 3857)) * 3.28084";
    //         const where = distanceFn + ' < 500';
    //         //fieldMap = activityType.fieldMap,
    //         const select = ['ST_X(the_geom) as x',
    //                         'ST_Y(the_geom) as y',
    //                         distanceFn + "AS distance",
    //                       ].join(', ');
    //         query = ['SELECT', select, 'FROM', table, 'WHERE', where].join(' ');
    //         return (query);
    //         }
    //     },
    //     success(data) {
    //       return data
    //     }
    //   }
    // },
    opa: {
      type: 'http-get',
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      options: {
        params: {
          parcel_number: feature => feature.properties.opa_account_num
        },
        success(data) {
          return data[0];
        }
      }
    },
    // TODO elections and divisions
    // elections: {
    //   url: 'https://api.phila.gov/elections',
    //   type: 'http-get',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // }
    // divisions: {
    //   url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
    //   type: 'http-get',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    stormwater: {
      type: 'http-get',
      url: 'https://api.phila.gov/stormwater',
      options: {
        params: {
          search: feature => feature.properties.street_address
        },
        success(data) {
          return data[0];
        }
      }
    },
    zoningAppeals: {
      type: 'http-get-nearby',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        table: 'li_appeals',
        calculateDistance: true,
        // dateField: 'dispatch_date',
        params: {
          // q: feature => "select * from li_appeals where address = '" + feature.properties.street_address + "'"// + "' or addrkey = " + feature.properties.li_address_key,
        }
      }
    },
    liPermits: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: feature => "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
        }
      }
    },
    liInspections: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: feature => "select * from li_case_inspections where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
        }
      }
    },
    liViolations: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: feature => "select * from li_violations where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
        }
      }
    },
    zoningDocs: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: feature => "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "' or addrkey = " + feature.properties.li_address_key,
        }
      }
    },
    // // TODO take zoningBase out and use AIS for base zoning district
    zoningBase: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/',
      options: {
        relationship: 'contains',
      },
      success(data) {
        return data;
      }
    },
    rco: {
      type: 'esri',
      url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // success(data) {
      //   // format phone numbers
      //   console.log('rco success', data);
      //
      //   var s2 = (""+s).replace(/\D/g, '');
      //   var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      //   return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
      //
      //   return data;
      // }
    },
    dorDocuments: {
      type: 'http-get',
      targets: {
        get(state) {
          return state.dorParcels;
        },
        getTargetId(target) {
          return target.properties.OBJECTID;
        },
      },
      url: '//ase.phila.gov/arcgis/rest/services/RTT/MapServer/0/query',
      options: {
        params: {
          where(feature, state) {
            // METHOD 1: via address
            // const parcel = state.dorParcels[0];
            const parcelBaseAddress = concatDorAddress(feature);

            // REVIEW if the parcel has no address, we don't want to query
            // WHERE ADDRESS = 'null' (doesn't make sense), so use this for now
            if (!parcelBaseAddress || parcelBaseAddress === 'null') return '1 = 0';

            let where = `ADDRESS = '${parcelBaseAddress}'`;

            // check for unit num
            const unitNum = cleanDorAttribute(feature.properties.UNIT);

            if (unitNum) {
              where += ` AND CONDO_UNIT = '${unitNum}'`;
            }

            // METHOD 2: via parcel id - the layer doesn't have mapreg yet, though
            // const mapreg = feature.properties.MAPREG;
            // const where = `MAPREG = '${mapreg}'`;

            // console.log('dor docs where', where);

            return where;
          },
          outFields: '*',
          f: 'json'
        },
        success(data) {
          return data.features;
        }
      },
    },
    '311': {
      type: 'esri-nearby',
      url: 'http://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYSab/MapServer/0',
      options: {
        geometryServerUrl: 'http://192.168.103.143:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/',
        radius: 500,
        units: 'feet',
        calculateDistance: true
      },
    },
    crimeIncidents: {
      type: 'http-get-nearby',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        table: 'incidents_part1_part2',
        dateMinNum: 1,
        dateMinType: 'year',
        dateField: 'dispatch_date',
        params: {
          // q: feature => "select * from incidents_part1_part2"// where dc_key = '201501056051'"//the_geom.STDistance(" + ")"// + feature.properties.street_address + "'"// + "' or addrkey = " + feature.properties.li_address_key,
        },
        calculateDistance: true
      }
    },
    vacantLand: {
      type: 'esri',
      url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // params: {
      //   query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0'}).contains(feature)
      // },
      success(data) {
        return data;
      }
    },
    vacantBuilding: {
      type: 'esri',
      url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // params: {
      //   query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0'}).contains(feature)
      // },
      success(data) {
        return data;
      }
    },
    zoningOverlay: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1/',
      options: {
        relationship: 'contains',
      },
      success(data) {
        return data;
      }
    },
    regmaps: {
      type: 'esri',
      url: '//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/0',
      options: {
        relationship: 'intersects',
      },
      success(data) {
        return data;
      }
    },
    // zoningOverlays: {
    //   type: 'esri',
    //   url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1/',
    //   options: {
    //     relationship: 'contains',
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
  },
  imageOverlayGroups: {
    regmaps: {
      items(state) {
        // console.log('main.js imageOverlayGroups', state)
        return state.sources.regmaps.data;
      }
    }
  },
  legendControls: {
    'water':
      {
        'Roof': '#FEFF7F',
        'Other Impervious Surface': '#F2DCFF'
      }
  },
  overlays: {
    '311': {
      type: 'point',
      dataSource: '311',
      options: {
        marker: 'circle',
        style: {
          radius: 6,
          fillColor: '#ff3f3f',
        	color: '#ff0000',
        	weight: 1,
        	opacity: 1,
        	fillOpacity: 1.0
        },
      },
    },
    'crimeIncidents': {
      type: 'point',
      dataSource: 'crimeIncidents',
      options: {
        marker: 'circle',
        style: {
          radius: 6,
          fillColor: '#477bd2',
        	color: '#477bd2',
        	weight: 1,
        	opacity: 1,
        	fillOpacity: 1.0
        },
      },
    },
  },
  cyclomedia: {
    enabled: false
  },
  pictometry: {
    enabled: false
  },
  // reusable transforms for topic data. see `topics` section for usage.
  transforms: {
    currency: {
      // a list of global objects this transform depends on
      globals: ['accounting'],
      // this is the function that gets called to perform the transform
      transform(value, globals) {
        const accounting = globals.accounting;
        return accounting.formatMoney(value);
      }
    },
    date: {
      globals: ['moment'],
      transform(value, globals) {
        const moment = globals.moment;
        return moment(value).format('MM/DD/YYYY');
      }
    },
    phoneNumber: {
      transform(value) {
        const s2 = (""+value).replace(/\D/g, '');
        const m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
      }
    },
    rcoPrimaryContact: {
      transform(value) {
        const PHONE_NUMBER_PAT = /\(?(\d{3})\)?( |-)?(\d{3})(-| )?(\d{4})/g;
        const m = PHONE_NUMBER_PAT.exec(value);

        // check for non-match
        if (!m) {
          return value;
        }

        // standardize phone number
        const std = ['(', m[1], ') ', m[3], '-', m[5]].join('');
        const orig = m[0]
        const valueStd = value.replace(orig, std);

        return valueStd;
      }
    },
    booleanToYesNo: {
      transform(value) {
        return value ? 'Yes' : 'No';
      }
    }
  },
  topics: [
    {
      key: 'opa',
      icon: 'map-marker',
      label: 'Property Assessments',
      // REVIEW can these be calculated from vue deps?
      dataSources: ['opa'],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'This information is provided by the Office of Property Assessments (OPA), the agency responsible for estimating property values in the City of Philadelphia. OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City websites may still use that name.'
          }
        },
        {
          type: 'vertical-table',
          slots: {
            // title: 'Account',
            fields: [
              {
                label: 'OPA Account #',
                value(state) {
                  return state.geocode.data.properties.opa_account_num;
                }
              },
              {
                label: 'OPA Address',
                value(state) {
                  return state.geocode.data.properties.opa_address;
                }
              },
              {
                label: 'Owners',
                value(state) {
                  const owners = state.geocode.data.properties.opa_owners;
                  const ownersJoined = owners.join(', ');
                  return ownersJoined;
                }
              },
              {
                label: `Assessed Value (${new Date().getFullYear()})`,
                value(state) {
                  const data = state.sources.opa.data;
                  return data.market_value;
                },
                transforms: [
                  'currency'
                ]
              },
              {
                label: 'Sale Date',
                value(state) {
                  const data = state.sources.opa.data;

                  return data.sale_date;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Sale Price',
                value(state) {
                  const data = state.sources.opa.data;
                  return data.sale_price;
                },
                transforms: [
                  'currency'
                ]
              },
            ],
          },
          options: {
            externalLink: {
              action(count) {
                return `See more`;
              },
              name: 'Property Search',
              href(state) {
                const id = state.geocode.data.properties.opa_account_num;
                // const addressEncoded = encodeURIComponent(address);
                return `//property.phila.gov/?p=${id}`;
              }
            }
          }
        }
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd'
    },
    {
      key: 'deeds',
      icon: 'book',
      label: 'Deeds',
      // TODO uncommenting this causes the no-content view to show up.
      dataSources: ['dorDocuments'],
      components: [
        {
          type: 'collection-summary',
          options: {
            descriptor: 'parcel',
            // this will include zero quantities
            // includeZeroes: true,
            getValue(item) {
              return item.properties.STATUS;
            },
            context: {
              singular: list => `There is ${list} at this address.`,
              plural: list => `There are ${list} at this address.`
            },
            types: [
              {
                value: 1,
                label: 'active parcel'
              },
              {
                value: 2,
                label: 'inactive parcel'
              },
              {
                value: 3,
                label: 'remainder parcel'
              }
            ]
          },
          slots: {
            items(state) {
              return state.dorParcels;
            }
          }
        },
        {
          type: 'tab-group',
          options: {
            getKey(item) {
              return item.properties.OBJECTID;
            },
            getTitle(item) {
              return item.properties.MAPREG;
            },
            // components for the content pane. this essentially a topic body.
            components: [
              {
                type: 'vertical-table',
                options: {
                  nullValue: 'None'
                },
                slots: {
                  title: 'Parcel Details',
                  fields: [
                    {
                      label: 'Map Registry #',
                      value(state, item) {
                        return item.properties.MAPREG;
                      },
                    },
                    {
                      label: 'Parcel Address',
                      value(state, item) {
                        return concatDorAddress(item);
                      },
                    },
                    {
                      label: 'Status',
                      value(state, item) {
                        const status = item.properties.STATUS;
                        let desc;
                        switch(status) {
                          case 1:
                            desc = 'Active';
                            break;
                          case 2:
                            desc = 'Inactive';
                            break;
                          case 3:
                            desc = 'Remainder';
                            break;
                          default:
                            break;
                        }
                        return desc;
                      },
                    },
                    {
                      label: 'Origination Date',
                      value(state, item) {
                        return item.properties.ORIG_DATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Inactive Date',
                      value(state, item) {
                        return item.properties.INACTDATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Has Air Rights',
                      value(state, item) {
                        const suffix = item.properties.SUFFIX;
                        return suffix === 'A' ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Is Condo',
                      value(state, item) {
                        return item.properties.CONDOFLAG ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Perimeter',
                      value(state, item) {
                        return Math.round(item.properties['SHAPE.LEN']) + ' ft';
                      },
                    },
                    {
                      label: 'Area',
                      value(state, item) {
                        return Math.round(item.properties['SHAPE.AREA']) + ' sq ft';
                      },
                    },
                  ]
                }  // end slots
              },  // end vertical table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'deeds',
                  id: 'dorDocuments',
                  // limit: 100,
                  fields: [
                    {
                      label: 'ID',
                      value(state, item) {
                        return "<a target='_blank' href='//pdx-app01/recorder/eagleweb/viewDoc.jsp?node=DOCC"+item.attributes.R_NUM+"'>"+item.attributes.R_NUM+"<i class='fa fa-external-link'></i></a>"
                      },
                    },
                    {
                      label: 'Date',
                      value(state, item) {
                        return item.attributes.RECORDING_DATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Type',
                      value(state, item) {
                        return item.attributes.DOC_TYPE;
                      },
                    },
                    {
                      label: 'Grantor',
                      value(state, item) {
                        return item.attributes.GRANTOR;
                      },
                    },
                    {
                      label: 'Grantee',
                      value(state, item) {
                        return item.attributes.GRANTEE;
                      },
                    },
                  ], // end fields
                  sort: {
                    // this should return the val to sort on
                    getValue(item) {
                      return item.attributes.RECORDING_DATE;
                    },
                    // asc or desc
                    order: 'desc'
                  }
                },
                slots: {
                  title: 'Documents',
                  items(state, item) {
                    const id = item.properties.OBJECTID;
                    if (state.sources.dorDocuments.targets[id]) {
                      return state.sources.dorDocuments.targets[id].data;
                    } else {
                      return [];
                    }
                  },
                } // end slots
              }, // end docs table
            ] // end parcel tab content comps
          }, // end parcel tab options
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items(state) {
              return state.dorParcels;
            }
          }
        }, // end dor parcel tab group comp
        {
          type: 'overlay-toggle-group',
          options: {
            getKey(item) {
              return item.properties.RECMAP;
            },
          },
          slots: {
            title: 'Registry Maps',
            items(state) {
              return state.sources.regmaps.data;
            }
          }
        },
        {
          type: 'callout',
          slots: {
            text: 'The property boundaries displayed on the map are for reference only and may not be used in place of recorded deeds or land surveys. Source: Department of Records.'
          }
        }
      ], // end deeds comps
      basemap: 'dor',
      identifyFeature: 'dor-parcel',
      // identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'dor',
      // parcels: 'pwd'
      imageOverlayGroup: 'regmaps',
    },
    {
      key: 'permits',
      icon: 'wrench',
      label: 'Permits',
      dataSources: [
        'liPermits',
        'liInspections',
        'liViolations'
      ],
      components: [
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liPermits',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value(state, item){
                  return item.permitissuedate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"'>"+item.permitnumber+" <i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value(state, item){
                  return item.permitdescription
                }
              },
              {
                label: 'Status',
                value(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue(item) {
                return item.permitissuedate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action(count) {
                return `See ${count} more at L&I Property History`;
              },
              name: 'L&I Property History',
              href(state) {
                const address = state.geocode.data.properties.street_address;
                const addressEncoded = encodeURIComponent(address);
                return `//li.phila.gov/#summary?address=${addressEncoded}`;
              }
            }
          },
          slots: {
            title: 'Permits',
            items(state) {
              const data = state.sources['liPermits'].data.rows;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liInspections',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value(state, item){
                  return item.inspectioncompleted
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value(state, item){
                  return item.casenumber
                }
              },
              {
                label: 'Description',
                value(state, item){
                  return item.inspectiondescription
                }
              },
              {
                label: 'Status',
                value(state, item){
                  return item.inspectionstatus
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue(item) {
                return item.inspectioncompleted;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action(count) {
                return `See ${count} more at L&I Property History`;
              },
              name: 'L&I Property History',
              href(state) {
                const address = state.geocode.data.properties.street_address;
                const addressEncoded = encodeURIComponent(address);
                return `//li.phila.gov/#summary?address=${addressEncoded}`;
              }
            }
          },
          slots: {
            title: 'Inspections',
            items(state) {
              const data = state.sources['liInspections'].data.rows;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liViolations',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value(state, item){
                  return item.caseaddeddate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value(state, item){
                  return item.casenumber
                }
              },
              {
                label: 'Description',
                value(state, item){
                  return item.violationdescription
                }
              },
              {
                label: 'Status',
                value(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue(item) {
                return item.caseaddeddate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action(count) {
                return `See ${count} more at L&I Property History`;
              },
              name: 'L&I Property History',
              href(state) {
                const address = state.geocode.data.properties.street_address;
                const addressEncoded = encodeURIComponent(address);
                return `//li.phila.gov/#summary?address=${addressEncoded}`;
              }
            }
          },
          slots: {
            title: 'Violations',
            items(state) {
              const data = state.sources['liViolations'].data.rows;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
      ],
      basemap: 'pwd',
      dynamicMapLayers: [
        //'zoning'
      ],
      identifyFeature: 'address-marker',
      parcels: 'pwd'
    },
    {
      key: 'zoning',
      icon: 'building-o',
      label: 'Zoning',
      dataSources: [
        'zoningOverlay'
      ],
      components: [
        {
          type: 'badge',
          options: {
            titleBackground: '#58c04d'
          },
          slots: {
            title: 'Base District',
            value(state) {
              return state.geocode.data.properties.zoning;
            },
            description(state) {
              const code = state.geocode.data.properties.zoning;
              return ZONING_CODE_MAP[code];
            },
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningOverlay',
            // limit: 100,
            fields: [
              {
                label: 'Name',
                value(state, item){
                  return item.properties.OVERLAY_NAME
                }
              },
              {
                label: 'Code Section',
                value(state, item){
                  // return item.properties.CODE_SECTION
                  return "<a target='_blank' href='"+item.properties.CODE_SECTION_LINK+"'>"+item.properties.CODE_SECTION+" <i class='fa fa-external-link'></i></a>"
                }
              },
            ],
          },
          slots: {
            title: 'Overlays',
            items(state) {
              const data = state.sources['zoningOverlay'].data
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningAppeals',
            // limit: 100,
            fields: [
              {
                label: 'Date',
                value(state, item){
                  return item.processeddate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value(state, item){
                  //return item.appeal_key
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=zoningboardappeals&eid="+item.appealno+"'>"+item.appealno+"<i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value(state, item){
                  return item.appealgrounds
                }
              },
              {
                label: 'Status',
                value(state, item){
                  // return item.properties.CODE_SECTION
                  return item.decision
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue(item) {
                return item.processeddate;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title : 'Appeals',
            items(state) {
              const data = state.sources['zoningAppeals'].data.rows;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningDocs',
            // limit: 100,
            fields: [
              {
                label: 'Date',
                value(state, item){
                  return item.scandate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value(state, item){
                  return item.appid + '-' + item.docid
                }
              },
              {
                label: 'Type',
                value(state, item){
                  return item.doctype
                }
              },
              {
                label: '# Pages',
                value(state, item){
                  return item.page_numbers
                }
              },
              {
                label: 'Link',
                value(state, item){
                  // return "<a href='//www.washingtonpost.com/'>View Scan</a>"
                  return "<a target='_blank' href='//www.phila.gov/zoningarchive/Preview.aspx?address=" + item.address + "&&docType=" + item.doctype + "&numofPages=" + item.page_numbers + "&docID=" + item.docid + "&app=" + item.appid +"'>View Scan <i class='fa fa-external-link'></i></a>"
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue(item) {
                return item.scandate;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title: 'Documents',
            subtitle: 'aka "Zoning Archive"',
            items(state) {
              const data = state.sources['zoningDocs'].data.rows;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'rco',
            // limit: 100,
            fields: [
              {
                label: 'RCO',
                value(state, item) {
                  return '<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
                  + item.properties.ORGANIZATION_ADDRESS
                },
              },
              {
                label: 'Meeting Address',
                value(state, item) {
                  return item.properties.MEETING_LOCATION_ADDRESS
                }
              },
              {
                label: 'Primary Contact',
                value(state, item) {
                  // return item.properties.PRIMARY_PHONE
                  return item.properties.PRIMARY_NAME + '<br>'
                  + item.properties.PRIMARY_PHONE + '<br>'
                  + `<b><a :href="'mailto:' + item.properties.PRIMARY_EMAIL">`
                  + item.properties.PRIMARY_EMAIL + '</a></b>'
                },
                transforms: [
                  'rcoPrimaryContact'
                ]
              },
              {
                label: 'Preferred Method',
                value(state, item){
                  return item.properties.PREFFERED_CONTACT_METHOD
                }
              },
            ],
            externalLink: {
              forceShow: true,
              action() {
                return `See a list of all RCOs in the city [PDF]`;
              },
              name: '',
              href(state) {
                // const address = state.geocode.data.properties.street_address;
                // const addressEncoded = encodeURIComponent(address);
                return `//www.phila.gov/CityPlanning/projectreviews/RCO%20Related/List_of_RCOs.pdf`;
              }
            }
          },
          slots: {
            title: 'Registered Community Organizations',
            items(state) {
              const data = state.sources['rco'].data;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            },
          },
        },
      ],
      basemap: 'dor',
      dynamicMapLayers: [
        'zoning'
      ],
      identifyFeature: 'dor-parcel',
      parcels: 'dor'
    },
    {
      key: 'water',
      icon: 'tint',
      label: 'Water',
      dataSources: ['stormwater'],
      basemap: 'pwd',
      dynamicMapLayers: [
        'stormwater'
      ],
      identifyFeature: 'pwd-parcel',
      parcels: 'pwd',
      components: [
        {
          type: 'callout',
          slots: {
            text: 'The property boundaries displayed on the map for reference only and may not be used in place of recorded deeds or land surveys. Boundaries are generalized for ease of visualization. Source: Philadelphia Water'
          }
        },
        {
          type: 'vertical-table',
          slots: {
            title: 'Parcel',
            fields: [
              {
                label: 'Parcel ID',
                value(state) {
                  // return state.geocode.data.properties.pwd_parcel_id;
                  return state.sources.stormwater.data.Parcel.ParcelID;
                }
              },
              {
                label: 'Address',
                value(state) {
                  return state.sources.stormwater.data.Parcel.Address;
                }
              },
              {
                label: 'Building Type',
                value(state) {
                  return state.sources.stormwater.data.Parcel.BldgType;
                }
              },
              {
                label: 'Gross Area',
                value(state) {
                  return state.sources.stormwater.data.Parcel.GrossArea + ' sq ft';
                }
              },
              {
                label: 'Impervious Area',
                value(state) {
                  return state.sources.stormwater.data.Parcel.ImpervArea + ' sq ft';
                }
              },
              {
                label: 'CAP Eligible',
                value(state) {
                  return state.sources.stormwater.data.Parcel.CAPEligible;
                },
                transforms: [
                  'booleanToYesNo'
                ]
              },
            ]
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'water',
            id: 'stormwater',
            // limit: 100,
            // TODO this isn't used yet, but should be for highlighting rows/
            // map features.
            // overlay: '311',
            fields: [
              {
                label: 'Account #',
                value(state, item) {
                  return item.AccountNumber;
                }
              },
              {
                label: 'Customer',
                value(state, item) {
                  return item.CustomerName;
                }
              },
              {
                label: 'Status',
                value(state, item) {
                  return item.AcctStatus;
                }
              },
              {
                label: 'Service Type',
                value(state, item) {
                  return item.ServiceTypeLabel;
                }
              },
              {
                label: 'Size',
                value(state, item) {
                  return item.MeterSize;
                }
              },
              {
                label: 'Stormwater',
                value(state, item) {
                  return item.StormwaterStatus;
                }
              }
            ],
            externalLink: {
              forceShow: true,
              action(count) {
                return `See more at Stormwater Billing`;
              },
              name: 'Stormwater Billing',
              href(state) {
                const id = state.sources.stormwater.data.Parcel.ParcelID;
                return `//www.phila.gov/water/swmap/Parcel.aspx?parcel_id=${id}`;
              }
            }
          },
          slots: {
            title: 'Accounts',
            items(state) {
              const data = state.sources['stormwater'].data
              const rows = data.Accounts.map(row => {
                const itemRow = Object.assign({}, row);
                return itemRow;
              });
              return rows;
            }
          }
        }
      ]
    },
    {
      key: 'vacancy',
      icon: 'map-marker',
      label: 'Vacancy',
      dataSources: ['vacantLand', 'vacantBuilding', '311', 'crimeIncidents'],
      basemap: 'pwd',
      featureLayers: [
        'vacantLand',
        'vacantBuilding'
      ],
      identifyFeature: 'address-marker',
      overlays: ['311', 'crimeIncidents'],
      parcels: 'pwd',
      // TODO implement this
      // computed: {
      //   label(state) {
      //     const land = state.sources.vacantLand.data
      //     const building = state.sources.vacantBuilding.data
      //     if (land.length === 0 && building.length === 0) {
      //       return 'Not Likely Vacant';
      //     } else if (land.length > 0) {
      //       return 'Likely Vacant Land';
      //     } else if (building.length > 0) {
      //       return 'Likely Vacant Building';
      //     }
      //   }
      // },
      components: [
        {
          type: 'callout',
          slots: {
            text: 'The location of properties across Philadelphia that are likely to be a vacant lot or vacant building based on an assessment of City of Philadelphia administrative datasets.'
          }
        },
        {
          type: 'badge',
          options: {
            titleBackground(state) {
              const text = getVacancyText(state);
              if (text.includes('Land')) {
                return 'orange';
              } else if (text.includes('Building')) {
                return 'purple';
              } else {
                return '#58c04d';
              }
            }
          },
          slots: {
            title: 'Vacancy',
            value(state) {
              return getVacancyText(state);
            },
            // description(state) {
            //   const code = state.geocode.data.properties.zoning;
            //   return ZONING_CODE_MAP[code];
            // },
          }
        },
        {
          type: 'table-group',
          options: {
            // getKey(item) {
            //   return item.properties.OBJECTID;
            // },
            // getTitle(item) {
            //   return item.properties.MAPREG;
            // },
            filters: [
              {
                type: 'data',
                getValue(item) {
                  return item;
                },
                label: 'What nearby activity would you like to see?',
                values: [
                  {
                    label: '311 Requests',
                    value: '311',
                  },
                  {
                    label: 'Crime Incidents',
                    value: 'crimeIncidents',
                  },
                  {
                    label: 'Zoning Appeals',
                    value: 'zoningAppeals',
                  }
                ]
              },
            ],
            // components for the content pane. this essentially a topic body.
            components: [
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: '311',
                  sort: {
                    getValue(item, method) {
                      let val;

                      if (method === 'date') {
                        val = item.properties.REQUESTED_DATETIME;
                      } else if (method === 'distance') {
                        val = item._distance;
                      }

                      return val;
                    }
                  },
                  filters: [
                    {
                      type: 'time',
                      getValue(item) {
                        return item.properties.REQUESTED_DATETIME;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: 'year',
                          value: '1',
                          unit: 'years',
                          direction: 'subtract',
                        }
                      ]
                    }
                  ],
                  filterFieldsByText: [
                    'DESCRIPTION',
                    'SUBJECT',
                    'ADDRESS'
                  ],
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#ff3f3f',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value(state, item) {
                        return item.properties.REQUESTED_DATETIME;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Address',
                      value(state, item) {
                        return item.properties.ADDRESS;
                      }
                    },
                    {
                      label: 'Subject',
                      value(state, item) {
                        if (item.properties.MEDIA_URL) {
                          return '<a target="_blank" href='+item.properties.MEDIA_URL+'>'+item.properties.SUBJECT+'</a>';
                        } else {
                          return item.properties.SUBJECT;
                        }
                      }
                    },
                    {
                      label: 'Description',
                      value(state, item) {
                        return item.properties.DESCRIPTION;
                      }
                    },
                    {
                      label: 'Distance',
                      value(state, item) {
                        return `${item._distance} ft`;
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Nearby Service Requests',
                  data: '311',
                  items(state) {
                    const data = state.sources['311'].data;
                    const rows = data.map(row => {
                      const itemRow = Object.assign({}, row);
                      itemRow.DISTANCE = 'TODO';
                      return itemRow;
                    });
                    return rows;
                  },
                }
              },
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: 'crimeIncidents',
                  filters: [
                    {
                      type: 'time',
                      getValue(item) {
                        return item.dispatch_date;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        // {
                        //   label: 'year',
                        //   value: '1',
                        //   unit: 'years',
                        //   direction: 'subtract',
                        // }
                      ]
                    }
                  ],
                  filterFieldsByText: [
                    'text_general_code',
                  ],
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#6674df',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value(state, item) {
                        return item.dispatch_date;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value(state, item) {
                        return item.location_block;
                      }
                    },
                    {
                      label: 'Description',
                      value(state, item) {
                        return item.text_general_code;
                      }
                    },
                    {
                      label: 'Distance',
                      value(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Crime Incidents',
                  data: 'crimeIncidents',
                  items(state) {
                    const data = state.sources['crimeIncidents'].data || [];
                    const rows = data.map(row => {
                      const itemRow = Object.assign({}, row);
                      itemRow.DISTANCE = 'TODO';
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: 'zoningAppeals',
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#6674df',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value(state, item) {
                        return item.decisiondate;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value(state, item) {
                        return item.address;
                      }
                    },
                    {
                      label: 'Description',
                      value(state, item) {
                        return item.appealgrounds;
                      }
                    },
                    // {
                    //   label: 'Distance',
                    //   value(state, item) {
                    //     return parseInt(item.distance) + ' ft';
                    //   }
                    // }
                  ]
                },
                slots: {
                  title: 'Zoning Appeals',
                  data: 'zoningAppeals',
                  items(state) {
                    const data = state.sources['zoningAppeals'].data || [];
                    const rows = data.map(row => {
                      const itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
            ], // end comps
          }, // end options
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items(state) {
              return state.pwdParcel;
            }
          },
        }
      ]
    },
    {
      key: '311',
      icon: 'phone',
      label: '311',
      dataSources: ['311'],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // overlays: ['311'],
      parcels: 'pwd',
      components: [
        {
          type: 'callout',
          slots: {
            text: 'The information shown includes records marked private by the public, as well as a "Description" field which can not be shared with the public for any record.'
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: '311',
            id: '311',
            filters: [
              {
                type: 'time',
                getValue(item) {
                  return item.properties.REQUESTED_DATETIME;
                },
                label: 'From the last',
                values: [
                  {
                    label: '30 days',
                    value: '30',
                    unit: 'days',
                    direction: 'subtract',
                  },
                  {
                    label: '90 days',
                    value: '90',
                    unit: 'days',
                    direction: 'subtract',
                  },
                  {
                    label: 'year',
                    value: '1',
                    unit: 'years',
                    direction: 'subtract',
                  }
                ]
              }
            ],
            filterFieldsByText: [
              'DESCRIPTION',
              'SUBJECT',
              'ADDRESS'
            ],
            mapOverlay: {
              marker: 'circle',
              style: {
                radius: 6,
                fillColor: '#ff3f3f',
              	color: '#ff0000',
              	weight: 1,
              	opacity: 1,
              	fillOpacity: 1.0
              },
              hoverStyle: {
                radius: 6,
                fillColor: 'yellow',
              	color: '#ff0000',
              	weight: 1,
              	opacity: 1,
              	fillOpacity: 1.0
              }
            },
            fields: [
              {
                label: 'Date',
                value(state, item) {
                  return item.properties.REQUESTED_DATETIME;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Address',
                value(state, item) {
                  return item.properties.ADDRESS;
                }
              },
              {
                label: 'Subject',
                value(state, item) {
                  if (item.properties.MEDIA_URL) {
                    return '<a target="_blank" href='+item.properties.MEDIA_URL+'>'+item.properties.SUBJECT+'</a>';
                  } else {
                    return item.properties.SUBJECT;
                  }
                }
              },
              {
                label: 'Description',
                value(state, item) {
                  return item.properties.DESCRIPTION;
                }
              },
              {
                label: 'Distance',
                value(state, item) {
                  return `${item._distance} ft`;
                }
              }
            ]
          },
          slots: {
            title: 'Nearby Service Requests',
            items(state) {
              const data = state.sources['311'].data;
              const rows = data.map(row => {
                const itemRow = Object.assign({}, row);
                itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            },
            // filterText() {
            //   return 'from the last';
            // },
            // filterValues: {
            //   value1: {
            //     text: '30 days',
            //     value: '30'
            //   },
            //   value2: {
            //     text: '90 days',
            //     value: '90'
            //   },
            //   value3: {
            //     text: 'year',
            //     value: '365'
            //   }
            // },
          }
        }
      ]
    }
  ],
  // events: {
  //   geocodeResult(e) {
  //     console.log('**HOST** geocode result:', e.properties.street_address);
  //   }
  // }
});
