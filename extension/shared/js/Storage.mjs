import { browser, isBackground } from "/shared/js/Extension.mjs";

let StorageWrapper;
if (isBackground()) {
	/** Provides ordered readwrite access to the value for the given key in the given area. */
	StorageWrapper = class StorageWrapper {
		static #unset = Symbol("unset");
		#area;
		#key;
		#value = StorageWrapper.#unset;
		#fallback;
		#promise = Promise.resolve();

		/**
		 * @param {string} key - The name of the value.
		 * @param {Object} area - Which `browser.storage` to use.
		 * @param {*} fallback - The value to use if the `key` does not exist in the `area` yet.
		 */
		constructor(key, area, fallback) {
			this.#area = area;
			this.#key = key;
			this.#fallback = fallback;
		}

		/**
		 * Gets the value (after all previous operations are done).
		 * @return {Promise}
		 */
		async get() {
			return this.#enqueue(async () => {
				if (this.#value === StorageWrapper.#unset)
					await this.#load();
				return this.#value;
			});
		}

		/**
		 * @callback updateCallback
		 * @param {*} value - The value.
		 * @return {*}
		 */
		/**
		 * Updates the value (after all previous operations are done).
		 * @param {UpdateCallback} callback - Called after getting value to modify it before setting it.
		 * @return {Promise}
		 */
		async update(callback) {
			return this.#enqueue(async () => {
				if (this.#value === StorageWrapper.#unset)
					await this.#load();
				this.#value = await callback(this.#value);
				await this.#area.set({ [this.#key]: this.#value });
			});
		}

		/**
		 * Loads the value from the `area` and caches it.
		 */
		async #load() {
			let wrapper = await this.#area.get({ [this.#key]: this.#fallback });
			this.#value = wrapper[this.#key];
		}

		/**
		 * @callback enqueueCallback
		 * @param {*} value - The value.
		 * @return {*}
		 */
		/**
		 * Adds to the list of operations.
		 * @param {EnqueueCallback} operation - The operation.
		 * @return {Promise}
		 */
		async #enqueue(operation) {
			let promise = this.#promise;
			this.#promise = new Promise((resolve, reject) => {
				promise.finally(() => operation().then(resolve, reject));
			});
			return this.#promise;
		}
	};
} else {
	/** Provides read access to the value for the given key in the given area. */
	StorageWrapper = class StorageWrapper {
		#area;
		#key;
		#fallback;

		/**
		 * @param {string} key - The name of the value.
		 * @param {Object} area - Which `browser.storage` to use.
		 * @param {*} fallback - The value to use if the `key` does not exist in the `area` yet.
		 */
		constructor(key, area, fallback) {
			this.#area = area;
			this.#key = key;
			this.#fallback = fallback;
		}

		/**
		 * @callback watchCallback
		 * @param {*} value - The value.
		 */
		/**
		 * Gets the value and listens for future changes.
		 * @param {WatchCallback} callback - Called after getting the value and if the value changes later.
		 * @return {Promise}
		 */
		watch(callback) {
			this.#area.onChanged.addListener((changes) => {
				if (this.#key in changes)
					callback(changes[this.#key].newValue);
			});

			this.#area.get({ [this.#key]: this.#fallback }).then((wrapper) => {
				callback(wrapper[this.#key]);
			});
		}
	};
}
export let popupStorage = new StorageWrapper("popup", browser.storage.session, [ ]);
export let profilesStorage = new StorageWrapper("profiles", browser.storage.local, [ ]);
