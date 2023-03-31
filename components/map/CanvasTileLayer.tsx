import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	geoPositionBeforeZoom: L.LatLng | undefined;
	imageData: ImageData | undefined;
	srcPos: L.Point;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create(
			'canvas',
			'leaflet-tile-pane leaflet-zoom-animated',
		);
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
		this.srcPos = new L.Point(0, 0);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLImageElement {
		const tile = super.createTile(coords, done) as HTMLImageElement;
		tile.crossOrigin = 'Anonymous';
		const url = this.getTileUrl(coords);

		this.canvasRedraw(tile, url, coords);

		return tile;
	}

	private canvasRedraw(tile: HTMLImageElement, url: string, coords: L.Coords) {
		// @ts-ignore
		const pos = this._getTilePos(coords);

		tile.onload = () => {
			// delete the original tile that was created with createTile
			this.removeTileElement(tile);
			const posCanvas = L.DomUtil.getPosition(this.canvas);

			this.srcPos = this._map.latLngToLayerPoint(
				// @ts-ignore
				this._map.unproject(this._level.origin),
			);

			this.ctx?.drawImage(
				tile,
				pos.x - posCanvas.x + this.srcPos.x,
				pos.y - posCanvas.y + this.srcPos.y,
				this.tileSize.x,
				this.tileSize.y,
			);
		};

		tile.onerror = () => {
			console.log(`Failed to load tile: ${url}`);
		};
	}

	removeTileElement(tile: HTMLElement) {
		tile.parentNode?.removeChild(tile);
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);

		this.getPane()?.appendChild(this.canvas);

		map.on('zoomstart', () => {
			const currentBounds = map.getPixelBounds();

			if (currentBounds.min) {
				this.geoPositionBeforeZoom = map.layerPointToLatLng(currentBounds.min);
			}

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.imageData = imageData;
		});

		map.on('zoomend', () => {
			const currentBounds = map.getPixelBounds();

			const layerPositionBeforeZoom = map.latLngToLayerPoint(
				this.geoPositionBeforeZoom!,
			);

			const zoomDeltaX = currentBounds.min
				? Math.floor(currentBounds.min.x - layerPositionBeforeZoom.x)
				: 0;
			const zoomDeltaY = currentBounds.min
				? Math.floor(currentBounds.min.y - layerPositionBeforeZoom.y)
				: 0;

			const scale = this._map.getZoomScale(
				this._map.getZoom(),
				// @ts-ignore
				this._level.zoom,
			);

			this.ctx?.putImageData(
				this.imageData!,
				-zoomDeltaX,
				-zoomDeltaY,
				0,
				0,
				this.canvas.width * scale,
				this.canvas.height * scale,
			);
		});

		// _setView
		map.on('zoomanim', (event: L.ZoomAnimEvent) => {
			const scale = this._map.getZoomScale(
				this._map.getZoom(),
				// @ts-ignore
				this._level.zoom,
			);

			const delta = new L.Point(
				Math.round(
					// @ts-ignore
					map._getNewPixelOrigin(event.center, event.zoom).x * scale -
						map.getPixelOrigin().x,
				),
				Math.round(
					// @ts-ignore
					map._getNewPixelOrigin(event.center, event.zoom).y * scale -
						map.getPixelOrigin().y,
				),
			);

			console.log(delta);

			// вычислить дельту центра после зума и текущего и записать в css transform origin
			L.DomUtil.setTransform(this.canvas, delta, scale);
			this.canvas.style.transformOrigin = `${delta.x}px ${delta.y}px`;
		});

		// в зуменд анимацию убирать

		map.on('moveend', () => {
			const containerPointToLatLng = map.containerPointToLayerPoint([0, 0]);
			L.DomUtil.setPosition(this.canvas, containerPointToLatLng);
			const pos = L.DomUtil.getPosition(this.canvas);

			this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx?.clearRect(0, this.srcPos.y, this.canvas.width, this.srcPos.y);

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.ctx?.putImageData(
				imageData!,
				pos.x - containerPointToLatLng.x,
				pos.y - containerPointToLatLng.y,
			);

			for (const tile of Object.values(this._tiles)) {
				// @ts-ignore
				const pos = this._getTilePos(tile.coords);
				this.ctx?.drawImage(
					tile.el as HTMLImageElement,
					pos.x - containerPointToLatLng.x + this.srcPos.x,
					pos.y - containerPointToLatLng.y + this.srcPos.y,
					this.tileSize.x,
					this.tileSize.y,
				);
			}
		});

		return this;
	}
}

export default CanvasTileLayer;
