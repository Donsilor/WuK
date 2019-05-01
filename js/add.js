 $(function () {
    //  isAddedPage 判断是否点击'已添加',未点击：0 / 已点击：1
    var isAddedPage = 0; 
    var isSearch = 0;
    var word = '';
    var selectedExchange = 'all';
    var cursor = 0;
    var count = 10;
    var total = 0;
    var method = 'GETURL';
    var dropload = null;
    var servicesSymbolList = [ services.symbol.symbol, services.symbol.mysymbol, services.symbol.search ];
    
    pagedropload();
    function pagedropload(){
        if ( dropload == undefined || dropload == null || dropload == "" ){
            var dropload = $('.content').dropload({
                scrollArea: window,
                loadDownFn: function (me) {
                    if (cursor - total >= 10) {
                        $('.dropload-down').remove();
                        return;
                    };

                    // 简化代码量，直接赋值给 isAddedPage selectedExchange
                    if ( isSearch == 2 ){
                        selectedExchange = word;
                        isAddedPage = 2;
                    };


                    servicesSymbolList[isAddedPage]({ selectedExchange, cursor, count }, method).then(function (data) {
                        if (data.r == 1) {
                            total = data.total;
                            if ( total == 0 ){
                                $('.dropload-down').remove();
                                return;
                            };

                            if (cursor - total >= 0) {
                                $('.dropload-down').remove();
                                return;
                            };

                            // 这里是取出 data.list 的每一个key
                            for (let item in data.list) {
                                // 通过 key 获取对象的每个值 value
                                let obj = data.list[item];
//                              console.log(obj)

                                $(".add_money").append(`
                                    <li>
                                        <div class="fl">
                                            <div>${obj.symbol}</div>
                                            <div>${(function(type){
                                                    if ( type == 'binance' ){
                                                        return '币安';
                                                    } else if ( type == 'okex' ) {
                                                        return 'Okcoin';
                                                    } else {
                                                        return '火币';
                                                    };
                                                 })(obj.exchange)}</div>
                                        </div>
                                        <div class="fr ${[" ",`frblue`][
                                            (function(page, focused){
                                                if ( page == 1 ){
                                                    return 1;
                                                } else {
                                                    if ( focused == 0 ){
                                                        return 0;
                                                    } else {
                                                        return 1;
                                                    }
                                                }
                                             })(isAddedPage, obj.focused)]}" data-type="${obj.focused}"></div>
                                    </li>
                                `);
                            }

                            console.log('isAddedPage:'+ isAddedPage +' Cursor:'+ cursor +' Total:'+ total);
                            cursor = cursor + 10;
                            me.resetload();

                        } else {
                            console.log(JSON.stringify(data.error));
                            me.resetload();
                        };

                    }).catch(e => {
                        console.log(e);
                        me.resetload();
                    });
                }
            });
            dropload = null;
        };
    };

    $(document).on("click", ".flex li", function () {
        isSearch = 0;
        cursor = 0;
        total = 0;
        dropload = null;
        $('input')[0].value = '';
        selectedExchange = ['all','okex','binance','huobipro','all',][+$(this).attr('data-type')];

        $('#flex li').removeClass('underline');
        $(this).addClass('underline');
        $('.add_money').html('');
        $('.dropload-down').remove();

        switch (+$(this).attr('data-type')) {
            case 4: {
                isAddedPage = 1;
                break;
            };
            default: isAddedPage = 0;
        };
        pagedropload();
    });

    $(document).on("click", ".fr", function () {
        // 获取 添加 按钮所在的交易所与交易对
        var exchange = $(this).prev($(this)).children().next().html();
        var symbol= $(this).prev($(this)).find('div').first().text();
        var $this = $(this);
        
        isSearch = 0;
        dropload = null;
        $('input')[0].value = '';
        if ( exchange == '币安' ) {
            exchange = 'binance';
        } else if ( exchange == 'Okcoin' ) {
            exchange = 'okex';
        } else {
            exchange = 'huobipro';
        };

        createDiv();
        if ( $this.attr('data-type') == 0 ) {
            $this.addClass('frblue');
            $this.attr('data-type', 1);
            services.symbol.add({  exchange, symbol }).then(function(data){
                if( data.r == 0 ){
                	$this.css('background-image','url(../images/rem_01.png)');
                    $('.pop_wrap').css('display','block');
                    $('.quit').css('display','block');
                    $('.qu_title').html("对不起,您没有添加币种权限<br/>请联系客服升级VIP客户");
                    setTimeout(function(){
                    	window.location.pathname = 'WuK/top_up.html';
                    },3000)
                    $('.affirm').click(function(){
                    	window.location.pathname = 'WuK/top_up.html';
                    })
                }
            });
        } else {
            $this.removeClass('frblue');
            $this.attr('data-type', 0);
            // 每取消关注币种，游标减一，从服务端获取的数据才不会错乱
            cursor = cursor - 1;

            services.symbol.del({  exchange, symbol }).then(function(data){
                if( data.r == 0 ){
                    $('.pop_wrap').css('display','block');
                    $('.quit').css('display','block');
                    $('.qu_title').text(JSON.stringify(data.msg));
                }
            });
        };
    });

    $('#searchBtn').click(function (){
        if ( $('input')[0].value == '' ) {
            createDiv();
            $('.pop_wrap').css('display','block');
            $('.quit').css('display','block');
            $('.qu_title').text('请输入搜索条件！');
            return;
        };

        isSearch = 2;
        word = $('input')[0].value;
        cursor = 0;
        total = 0;
        dropload = null;
        $('.dropload-down').remove();
        $('.add_money').html('');
        pagedropload();
    });
});	