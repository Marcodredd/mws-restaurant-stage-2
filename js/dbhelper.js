
  'use strict';
  //check fo support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
  }
/**
 * Create database
 */
  var dbPromise = idb.open('restaurant-db', 2, function(upgradeDb) {
    switch(upgradeDb.oldVersion) {
      case 0:
      case 1:
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
    }
  });  

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337// Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      var store = tx.objectStore('restaurants');
  
      return store.getAll();
    }).then(function(restaurants) {
    if (restaurants.length !== 0) {
      callback(null, restaurants);
    } else {
      fetch(DBHelper.DATABASE_URL)
        .then(response => response.json())
        .then(function(restaurants) {

        dbPromise.then(function(db) {
          var tx = db.transaction('restaurants', 'readwrite');
          var store = tx.objectStore('restaurants');
    
          for (let restaurant of restaurants) {
              store.put(restaurant);
          }
          return tx.complete;          
          }).then(function() {
          console.log('Restaurants added to store');
          }).catch(function(error) {
          console.log('Error adding restaurants to store', error);
          }).finally(function(error) {
            callback(null, restaurants);
          })
          }).catch(error => callback(error, null))
        }
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      var storeId = tx.objectStore('restaurants');

      return storeId.get(parseInt(id))
    }).then(function(restaurant) {
     // restaurant = restaurants.find(r => r.id == id);
      
        if (restaurant) {
          callback(null, restaurant)
        } else {
          fetch(DBHelper.DATABASE_URL + '/' + id)
          .then(response => response.json())
          .then(function(restaurant) {
            dbPromise.then(function(db) {
              var tx = db.transaction('restaurants', 'readwrite');
              var storeId = tx.objectStore('restaurants');

              storeId.put(restaurant);
              return tx.complete;
            }).then(function() {
              console.log('Specific restaurant added to the store');
            }).catch(function(error) {
              console.log('Error saving restaurant', error);
            }).finally(function(error) {
              callback(null, restaurant);
            })
          }).catch(error => callback(error, null)) 
            }
        })
      
    /*DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });*/
  }
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

}

