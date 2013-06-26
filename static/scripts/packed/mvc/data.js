define(["libs/backbone/backbone-relational"],function(){var d=Backbone.RelationalModel.extend({});var e=Backbone.RelationalModel.extend({defaults:{id:"",type:"",name:"",hda_ldda:"hda",metadata:null},initialize:function(){this._set_metadata();this.on("change",this._set_metadata,this)},_set_metadata:function(){var i=new d();_.each(_.keys(this.attributes),function(j){if(j.indexOf("metadata_")===0){var l=j.split("metadata_")[1];i.set(l,this.attributes[j]);delete this.attributes[j]}},this);this.set("metadata",i,{silent:true})},get_metadata:function(i){return this.attributes.metadata.get(i)},urlRoot:galaxy_paths.get("datasets_url")});var c=e.extend({defaults:_.extend({},e.prototype.defaults,{chunk_url:null,first_data_chunk:null,chunk_index:-1,at_eof:false}),initialize:function(i){e.prototype.initialize.call(this);this.attributes.chunk_index=(this.attributes.first_data_chunk?1:0)},get_next_chunk:function(){if(this.attributes.at_eof){return null}var i=this,j=$.Deferred();$.getJSON(this.attributes.chunk_url,{chunk:i.attributes.chunk_index++}).success(function(k){var l;if(k.ck_data!==""){l=k}else{i.attributes.at_eof=true;l=null}j.resolve(l)});return j}});var g=Backbone.Collection.extend({model:e});var f=Backbone.View.extend({initialize:function(i){(new b(i)).render()},render:function(){var m=$("<table/>").attr({id:"content_table",cellpadding:0});this.$el.append(m);var i=this.model.get_metadata("column_names");if(i){m.append("<tr><th>"+i.join("</th><th>")+"</th></tr>")}var k=this.model.get("first_data_chunk");if(k){this._renderChunk(k)}var j=this,n=_.find(this.$el.parents(),function(o){return $(o).css("overflow")==="auto"}),l=false;if(!n){n=window}n=$(n);n.scroll(function(){if(!l&&(j.$el.height()-n.scrollTop()-n.height()<=0)){l=true;$.when(j.model.get_next_chunk()).then(function(o){if(o){j._renderChunk(o);l=false}})}});$("#loading_indicator").ajaxStart(function(){$(this).show()}).ajaxStop(function(){$(this).hide()})},_renderCell:function(k,i,l){var j=this.model.get_metadata("column_types");if(l!==undefined){return $("<td>").attr("colspan",l).addClass("stringalign").text(k)}else{if(j[i]==="str"||j==="list"){return $("<td>").addClass("stringalign").text(k)}else{return $("<td>").text(k)}}},_renderRow:function(i){var j=i.split("\t"),l=$("<tr>"),k=this.model.get_metadata("columns");if(j.length===k){_.each(j,function(n,m){l.append(this._renderCell(n,m))},this)}else{if(j.length>k){_.each(j.slice(0,k-1),function(n,m){l.append(this._renderCell(n,m))},this);l.append(this._renderCell(j.slice(k-1).join("\t"),k-1))}else{if(k>5&&j.length===k-1){_.each(j,function(n,m){l.append(this._renderCell(n,m))},this);l.append($("<td>"))}else{l.append(this._renderCell(i,0,k))}}}return l},_renderChunk:function(i){var j=this.$el.find("table");_.each(i.ck_data.split("\n"),function(k,l){j.append(this._renderRow(k))},this)}});var b=Backbone.View.extend({col:{chrom:null,start:null,end:null},url_viz:null,dataset_id:null,genome_build:null,initialize:function(i){var j=i.model.attributes.metadata.attributes;if(typeof j.chromCol==="undefined"||typeof j.startCol==="undefined"||typeof j.endCol==="undefined"){console.log("TabularButtonTrackster : Metadata for column identification is missing.")}else{this.col.chrom=j.chromCol-1;this.col.start=j.startCol-1;this.col.end=j.endCol-1}if(this.col.chrom===null){return}if(typeof i.model.attributes.id==="undefined"){console.log("TabularButtonTrackster : Dataset identification is missing.")}else{this.dataset_id=i.model.attributes.id}if(typeof i.model.attributes.url_viz==="undefined"){console.log("TabularButtonTrackster : Url for visualization controller is missing.")}else{this.url_viz=i.model.attributes.url_viz}if(typeof i.model.attributes.genome_build!=="undefined"){this.genome_build=i.model.attributes.genome_build}},events:{"mouseover tr":"btn_viz_show",mouseleave:"btn_viz_hide"},btn_viz_show:function(m){if(this.col.chrom===null){return}var q=$(m.target).parent();var n=q.children().eq(this.col.chrom).html();var i=q.children().eq(this.col.start).html();var k=q.children().eq(this.col.end).html();if(n!==""&&i!==""&&k!==""){var p={dataset_id:this.dataset_id,gene_region:n+":"+i+"-"+k};var l=q.offset();var j=l.left-10;var o=l.top;$("#btn_viz").css({position:"fixed",top:o+"px",left:j+"px"});$("#btn_viz").off("click");$("#btn_viz").click(this.create_trackster_action(this.url_viz,p,this.genome_build));$("#btn_viz").show()}},btn_viz_hide:function(){$("#btn_viz").hide()},create_trackster_action:function(i,k,j){return function(){var l={};if(j){l["f-dbkey"]=j}$.ajax({url:i+"/list_tracks?"+$.param(l),dataType:"html",error:function(){alert(("Could not add this dataset to browser")+".")},success:function(m){var n=window.parent;n.show_modal(("View Data in a New or Saved Visualization"),"",{Cancel:function(){n.hide_modal()},"View in saved visualization":function(){n.show_modal(("Add Data to Saved Visualization"),m,{Cancel:function(){n.hide_modal()},"Add to visualization":function(){$(n.document).find("input[name=id]:checked").each(function(){var o=$(this).val();k.id=o;n.frame_manager.frame_new({title:"Trackster",type:"url",content:i+"/trackster?"+$.param(k)});n.hide_modal()})}})},"View in new visualization":function(){var o=i+"/trackster?"+$.param(k);n.frame_manager.frame_new({title:"Trackster",type:"url",content:o});n.hide_modal()}})}});return false}},render:function(){var i=new IconButtonView({model:new IconButton({title:"Visualize",icon_class:"chart_curve",id:"btn_viz"})});this.$el.append(i.render().$el);$("#btn_viz").hide()}});var a=function(l,j,m,i){var k=new j({model:new l(m)});k.render();if(i){i.append(k.$el)}return k};var h=function(k,i){var j=$("<div/>").appendTo(i);return new f({el:j,model:new c(k)}).render()};return{Dataset:e,TabularDataset:c,DatasetCollection:g,TabularDatasetChunkedView:f,createTabularDatasetChunkedView:h}});