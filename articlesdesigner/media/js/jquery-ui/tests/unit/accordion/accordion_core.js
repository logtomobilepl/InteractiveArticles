(function( $ ) {

var setupTeardown = TestHelpers.accordion.setupTeardown,
	state = TestHelpers.accordion.state;

module( "accordion: core", setupTeardown() );

$.each( { div: "#list1", ul: "#navigation", dl: "#accordion-dl" }, function( type, selector ) {
	test( "markup structure: " + type, function() {
		expect( 4 );
		var element = $( selector ).accordion();
		ok( element.hasClass( "ui-accordion" ), "main element is .ui-accordion" );
		equal( element.find( ".ui-accordion-header" ).length, 3,
			".ui-accordion-header elements exist, correct number" );
		equal( element.find( ".ui-accordion-content" ).length, 3,
			".ui-accordion-content elements exist, correct number" );
		deepEqual( element.find( ".ui-accordion-header" ).next().get(),
			element.find( ".ui-accordion-content" ).get(),
			"content panels come immediately after headers" );
	});
});

test( "handle click on header-descendant", function() {
	expect( 1 );
	var element = $( "#navigation" ).accordion();
	$( "#navigation h2:eq(1) a" ).click();
	state( element, 0, 1, 0 );
});

test( "accessibility", function () {
	expect( 37 );
	var element = $( "#list1" ).accordion({
			active: 1
		}),
		headers = element.find( ".ui-accordion-header" );

	equal( element.attr( "role" ), "tablist", "element role" );
	headers.each(function( i ) {
		var header = headers.eq( i ),
			panel = header.next();
		equal( header.attr( "