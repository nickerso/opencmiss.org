"use strict";
(function(){
    var Util = { filterKey: function(array,key,val) {
		return array.filter(function(element){
			return element[key] === val;
		});
    },
				 partition: function(items, size) {
					 var result = _.groupBy(items, function(item, i) {
						 return Math.floor(i/size);
					 });
					 return _.values(result);
				 }
			   };

	var VersionsList = React.createClass({
		render: function(){
			return (
					<div className="versions-list">
					{this.props.versions.map(function(version){
						return (<div><p className="format-list"><commoncomps.DownloadBox name={version.name} downloads={version.formats} /></p></div>)
					})}
					</div>);
		}
	});

    var IronComponent = React.createClass({
	render: function(){
	    return (
		<div>
		<h2>OpenCMISS-Iron - Computation</h2>
		<p>Iron is a Fortran-based package for computation.</p>
		</div>
	    );
	}
    });

	var StableReleaseBox = React.createClass({
		render: function(){
			return (<div className="stable-release">
					<h3>Latest Release</h3>
					<div className="release-box">
					{this.props.children}
					</div>
					</div>);
		}
	});

	/**
	   <DevReleasesComponent> - a presentational component for showing development releases and source code.

	 */

	var DevReleasesBox = React.createClass({
		getInitialState: function(){
			return {"showing": false};
		},
		_toggleShow: function(){
			this.setState({'showing':!this.state.showing});
		},
		render: function(){
			var devVersionLabel;
			if (this.state.showing){
				return (<div className="dev-release">
						<a role="button" onClick={this._toggleShow}>Hide development versions and source code options...</a>
						{devVersionLabel}
						<div className="row row-content extras infobox striped">
						<div className="col-sm-8">
						<h3>Development Versions</h3>
						<div className="alert alert-info"><strong>May contain traces of nuts!</strong> These development versions of OpenCMISS-Zinc include newer features but may be unstable or may not run. It may be necessary to try multiple versions to get a working version.</div>
						{this.props.development}
						</div>
						<div className="col-sm-4 source-code sidebar">
						{this.props.source}
						</div>
						</div>
						</div>
					   );

			} else {
				return (<div className="dev-release"><a role="button" onClick={this._toggleShow}>Show development versions and source code options...</a></div>);
			}

		}
	});

    var ZincComponent = React.createClass({
		_nameForRelease: function(name){
			return name + ", for " + this.props.platform.label;
		},
		render: function(){
			var release = this.props.release;
			var devVersionsList = (<devversions.ZincDevVersionsList versions={this.props.developmentVersions} />);
			var sourceBox = (<zinccomponents.SourceCodeBox />);

			return (
					<div>
					<h2>OpenCMISS-Zinc - Visualisation</h2>
					<p>Zinc is a C++-based package for visualisation, with Python bindings available.</p>
					<StableReleaseBox>
					<commoncomps.DownloadBox name={this._nameForRelease(release.name)} downloads={release.formats} />
					</StableReleaseBox>
					<DevReleasesBox development={devVersionsList} source={sourceBox} />
					<commoncomps.InstallInstructions instructionsMap={zinccomponents.INSTRUCTIONS_MAP} currentPlatform={this.props.platform.value} />
					</div>
			);
		}
    });

	var PyZincComponent = React.createClass({
		render: function(){
			var release = this.props.release;
			var devList = (<devversions.PyZincDevVersionsList versions={this.props.developmentVersions} />);
			var installInstructions = (<commoncomps.InstallInstructions instructionsMap={pyzinccomponents.INSTALL_INSTRUCTIONS} currentPlatform={this.props.platform.value} />);
			var source = (<pyzinccomponents.SourceCodeBox />);
			return (
					<div>
					<h2>Python Bindings for OpenCMISS-Zinc</h2>
					<p>Bindings for using OpenCMISS-Zinc in Python.</p>
					<StableReleaseBox>
					<commoncomps.DownloadBox name={release.name} downloads={release.formats} />
					</StableReleaseBox>
					<DevReleasesBox development={devList} source={source} />
					{installInstructions}
					</div>
			);
		}
	});

	var PlatformPicker = React.createClass({

		_onPlatformSelectChange: function(event){
			this.props.onPlatformChange(event.target.value);
		},

		render: function(){
			var platforms = this.props.platforms;
			var selectedPlatform = this.props.currentPlatform;
			return (
					<form name="platformForm" className="platform-form">
					<label htmlFor="platformType">Platform</label>
					<select id="platformType" name="platformType" defaultValue={selectedPlatform.value} onChange={this._onPlatformSelectChange}>
					{platforms.map(function(platform,i){
						return <option value={platform.value} key={i}>{platform.label}</option>;
					})}
				</select>
					</form>
			);
		}

	});

	var PackageBox = React.createClass({
		render: function(){
			return (<div className="package-box col-sm-6">
					<div className="inner">
					<h3>{this.props.package.name}</h3>
					<p>{this.props.package.description}</p>
					<a href={"#/package/"+this.props.package.id} className="btn btn-default">Get {this.props.package.name}</a>
					</div>
					</div>);
		}
	});

	var PackageGrid = React.createClass({
		_splitPackages: function(packages){
			var packages = this.props.packages, splitPackages;
			if (packages == undefined || packages == null || !packages.length){
				return [];
			}
			return Util.partition(packages,2);
		},
		render: function(){
			var packages = this._splitPackages(this.props.packages);
			var packageComponents = packages.map(function(row){
				var rowPackages = row.map(function(pkg){
					return <PackageBox package={pkg} />;
				});
				return (<div className="row row-content">
						{rowPackages}
						</div>);
			});
			return (<div className="package-grid">
					{packageComponents}
					</div>);
		}
	});


	var PackageDetailsDialogue = React.createClass({
		componentDidMount: function(){
			var self = this;
			var props = this.props;
			var $dialog = $(this.refs.dialog);
			$dialog.on('hidden.bs.modal', function(){
				props.cancel();
			});
			if (this.props.pkg != undefined && this.props.pkg != null){
				$dialog.modal('show');
			}
		},

		componentDidUpdate: function(){
			if (this.props.pkg == undefined || this.props.pkg == null) {
				$(this.refs.dialog).modal('hide');
				return;
			}
			$(this.refs.dialog).modal('show');
		},

		render: function(){
			var modalContent = null;
			if (this.props.pkg != undefined && this.props.pkg != null) {
				modalContent = (<div className="modal-content">
								<div className="modal-header">
								<h2 className="default-style">{this.props.pkg.name}</h2>
								<span>{this.props.pkg.description}</span>
								</div>
								<div className="modal-body">
								</div>
								</div>)
			}

			return (<div className="modal fade" ref="dialog">
					<div className="modal-dialog">
					{modalContent}
					</div>
					</div>);
		}
	});


    var DownloadsPage = React.createClass({

		router: null,
	getPlatformForValue: function(platforms,value){
	    return _.first(Util.filterKey(platforms,"value",value));

	},
	_detectPlatform: function(){
		var ua = navigator.userAgent;
		var os = null;
		if (ua.indexOf('Linux') !== -1) { os = 'linux'; }
		if (ua.indexOf('Mac') !== -1) {os = 'mac';}
		if (ua.indexOf('Windows') !== -1) {os = 'windows';}
		return os;
	},

	changePlatform: function(platformVal){
	    var platform = this.getPlatformForValue(this.state.supportedOs,platformVal);
	    if (platform != null){
		this.setState({'currentPlatform':platform});
	    }
	},

		getInitialState: function(){
			return {"isLoading":true, "currentPackage":null, packages: this._getSampleData() }
		},

		_loadDownloads: function(){
			var self = this;
			$.ajax('/data/downloads.json').then(function(downloadsData){
				return $.ajax('/data/development_binaries.json').then(function(devBinaries){
					var data = $.extend(downloadsData, devBinaries);
					console.log(data);
					return data;
				}, function(error){
					console.log("Error occurred while getting development binaries. ",error);
				});
			},function(error){
				console.log("Error occurred while getting downloads data. ",error);
			}).then(function(downloadsData){
				var hostPlatform = self._detectPlatform() || "linux",
					defaultPlatform = self.getPlatformForValue(downloadsData.supportedOs,hostPlatform);

				var initialState = $.extend(downloadsData,{"isLoading": false,
														   "currentPlatform":defaultPlatform});
				self.setState(initialState);
			});
		},

		_getSampleData: function(){
			return [
				{id: "opencmiss",
				 name: "OpenCMISS",
				 description:"Complete collection of applications and libraries to get you started."},
				{id: "zinc",
				 name: "OpenCMISS-Zinc",
				 description:"Complete collection of applications and libraries to get you started."},
				{id: "iron",
				 name: "OpenCMISS-Iron",
				 description:"Complete collection of applications and libraries to get you started."}
			];

		},

		_packageForId: function(id){
			var matchedPackages = this.state.packages.filter(function(pkg){
				return pkg.id === id;
			});
			if (matchedPackages.length == 0){
				return null;
			}
			return matchedPackages[0];
		},

		_initialiseRoutes: function(){
			var self = this;
			var router = this.router = new Router().configure({
				notfound: function(){
					router.setRoute('/');
				}
			});
			router.on('/',function(){
				self.setState({
					currentPackage:null
				});
			});
			router.path("/package/",function(){
				this.on('/:pkgId/',function(pkgId){
					// TODO need to also redirect :pkgId/!
					//this.setRoute("/package/"+pkgId+"/home");
					self.setState({
						currentPackage:self._packageForId(pkgId)
					});
				});

				this.on('/:pkgId/:tab', function(pkgId, tab){
				});
				router.init();
			});
		},

		_onDialogueExit: function(){
			this.router.setRoute('/');
		},

		componentDidMount: function(){
			this._loadDownloads();
			this._initialiseRoutes();
		},

		render: function(){
			if (this.state.isLoading){
				return (<p>Loading...</p>);
			} else {
				var currPlatform = this.state.currentPlatform.value;
				var currReleases = this.state.releases[currPlatform];
				var currDevReleases = this.state.development_versions[devversions.PLATFORM_NAMES[currPlatform]];
				return (
						<div>
						<h1>Get OpenCMISS</h1>
						<p>Choose the right package for your use.</p>
						<PackageGrid packages={this._getSampleData()} />
						<PackageDetailsDialogue pkg={this.state.currentPackage} cancel={this._onDialogueExit} />
						</div>
				);
			}
		}
    });

    ReactDOM.render(<DownloadsPage />,document.getElementById("downloads"));
}());
