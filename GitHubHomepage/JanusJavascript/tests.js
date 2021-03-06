function preparePage(text) {
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(text, "text/xml");

	return JanusJS.buildPage(xmlDoc.documentElement);
}

QUnit
		.test(
				"Werte setzen",
				function(assert) {

					var page = preparePage("<DIALOG><STRING name='a' source='b' /><STRING name='b' /></DIALOG>");

					page.DataSources.a.setValue("3");

					assert.equal(page.DataSources.a.value, "3", "a  = 3");

					page.DataSources.b.setValue("5");

					assert.equal(page.DataSources.b.value, "5", "b = 5");
					assert.equal(page.DataSources.a.value, "5", " a = b ");

				});

QUnit
		.test(
				"Default setzen",
				function(assert) {

					var page = preparePage("<DIALOG><STRING name='a' source='b' /><STRING name='b' default='d' /></DIALOG>");

					page.DataSources.b.setValue("5");

					assert.equal(page.DataSources.b.value, "5", "b = 5");
					assert.equal(page.DataSources.a.value, "5", " a = b ");

					page.DataSources.b.refresh();

					assert.equal(page.DataSources.b.value, "d", "b = 'd' ");
					assert
							.equal(page.DataSources.a.value, "d",
									" a = b = 'd' ");

				});

QUnit
		.test(
				"Maptable",
				function(assert) {

					var page = preparePage("<DIALOG><MAPTABLE name='map'> <ENTRY value='a' text='Text a'/> <ENTRY value='b' text='Text b'/> <ENTRY value='c' text='Text c'/> </MAPTABLE></DIALOG>");

					page.DataSources.map.setValue("b");

					assert.equal(page.DataSources.map.list.currentRow, 1,
							"currentRow = 1");

				});

QUnit
		.test(
				"Maptable",
				function(assert) {

					var page = preparePage("<DIALOG><MAPTABLE name='map'> <ENTRY value='a' text='Text a'/> <ENTRY value='b' text='Text b'/> <ENTRY value='c' text='Text c'/> </MAPTABLE><STRING name='a' source='map'/></DIALOG>");

					page.DataSources.map.setValue("b");

					assert.equal(page.DataSources.a.value, "b", "a = 'b'");

				});

QUnit
		.test(
				"Maptable",
				function(assert) {

					var page = preparePage("<DIALOG><MAPTABLE name='map' source='b' > <ENTRY value='a' text='Text a'/> <ENTRY value='b' text='Text b'/> <ENTRY value='c' text='Text c'/> </MAPTABLE><STRING name='a' source='map'/><STRING name='b' /></DIALOG>");

					page.DataSources.b.setValue("c");

					assert.equal(page.DataSources.map.list.currentRow, 2,
							"currentRow = 2");
					assert.equal(page.DataSources.a.value, "c", "a = 'c'");

				});

QUnit
		.test(
				"table1",
				function(assert) {

					var page = preparePage("<DIALOG><TABLE name='sql' > <COLUMN name='a' /> <COLUMN name='b'/> </TABLE><STRING name='a' source='sql.a'/><STRING name='b' source='sql.b' /></DIALOG>");

					page.DataSources.sql.refresh();

					assert.equal(page.DataSources.a.value, "D0:0", "a");
					assert.equal(page.DataSources.b.value, "D0:1", "b ");

				});

QUnit
		.test(
				"table2",
				function(assert) {

					var page = preparePage("<DIALOG><STRING name='a' source='liste.currentRow' /><TABLE name='liste'><COLUMN name='value' /><COLUMN name='text' /></TABLE></DIALOG>");
					page.DataSources.liste.refresh();
					page.DataSources.liste.doUpdate = false;
					page.DataSources.liste.currentRow.setValue(1);

					assert.equal(page.DataSources.a.value, '1');

					page.DataSources.liste.currentRow.setValue(0);

					assert.equal(page.DataSources.a.value, '0');

				});

QUnit
		.test(
				"bean",
				function(assert) {

					tester = '';

					JanusJS.addClassFunction('test', function(command, values) {
						tester = command;
						testerA = values.aa;
						testerB = values.bb;
						return 'OK';
					})

					var page = preparePage("<DIALOG><STRING name='a' /> <STRING name='b'/> <BEAN name='bean' class='test'><CALL name='call' command='call'><SET name='aa' var='a' /><SET name='bb' var='b' /></CALL></BEAN></DIALOG>");

					page.DataSources.a.setValue('1');
					page.DataSources.b.setValue('2');

					page.DataSources.bean.call.refresh();

					assert.equal(tester, 'call');
					assert.equal(testerA, '1');
					assert.equal(testerB, '2');

				});

QUnit
		.test(
				"action",
				function(assert) {

					var tester = {};
					var callIndex = 1;

					JanusJS.addClassFunction('test', function(action, callOnOk,
							callOnError) {
						tester[action.getName()] = callIndex;
						callIndex++;
						if (callOnOk) {
							callOnOk();
						}
					})

					var page = preparePage("<DIALOG><STRING name='a' /> <STRING name='b'/> <STRING name='c'/> <ACTION name='testAction' class='test' foreach='a,b,c'></DIALOG>");

					page.DataSources.a.setValue('1');
					page.DataSources.b.setValue('2');
					page.DataSources.c.setValue('2');

					page.DataSources.testAction.refresh();

					assert.equal(tester['a'], 1);
					assert.equal(tester['b'], 2);
					assert.equal(tester['c'], 3);

				});

QUnit
		.test(
				"rules",
				function(assert) {

					var testListener = {
						hasError : function(rule) {
							this.counter++;
						},
						counter : 0
					};

					var page = JanusRules
							.prepareRulePage("<RULES><REGEXP name='first' message='Ein Fehler' re='^[0-9]+$' at='eingabe' move='eingabe' priority='3' /></RULES>");

					page.addListener(testListener);
					page.check({
						eingabe : 'a'
					});

					assert.equal(testListener.counter, 1);

					testListener.counter = 0;

					page.check({
						eingabe : '2'
					});

					assert.equal(testListener.counter, 0);

				});

QUnit.test("rules2", function(assert) {

	var done = assert.async();

	var onOk = function(assert, page) {

		var testListener = {
			hasError : function(rule) {
				this.counter++;
			},
			counter : 0
		};
		page.addListener(testListener);
		page.check({
			eingabe : 'a'
		});

		assert.equal(testListener.counter, 1);

		testListener.counter = 0;

		page.check({
			eingabe : '12'
		});

		assert.equal(testListener.counter, 0);
		done();
	};

	JanusRules.loadRulePage("regexp", onOk.bind(assert, assert));

});
