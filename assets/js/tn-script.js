/*--------------------------------------------------------------
 TABLE OF CONTENT

 1. FUNCTIONS
 2. INIT

 --------------------------------------------------------------*/

/*--------------------------------------------------------------
 1. FUNCTIONS
 --------------------------------------------------------------*/

'use strict';
var maxblog_functions = {

    tn_breaking_new_data: [],
    tn_block_featured_data: [],
    tn_block_post_1_data: [],
    tn_block_post_2_data: [],
    tn_block_post_3_data: [],
    tn_block_post_4_data: [],

    //get data
    get_data: function (tn_post_data, page, old_page_name) {
        page = page || 1;
        old_page_name = old_page_name || '';
        tn_post_data = tn_post_data || [];
        var check_page = true;
        var tn_url = '/rss/' + page + '/';

        //call ajax
        $.ajax({
            type: 'get',
            url: tn_url,
            success: function (data_response) {
                var page_name = $(data_response).find('item').find('guid').text();
                //check page
                if (old_page_name != page_name) {

                    //reset data
                    maxblog_functions.tn_breaking_new_data = [];
                    maxblog_functions.tn_block_featured_data = [];
                    maxblog_functions.tn_block_post_1_data =  [];
                    maxblog_functions.tn_block_post_2_data = [];
                    maxblog_functions.tn_block_post_3_data= [];
                    maxblog_functions.tn_block_post_4_data= [];

                    $(data_response).find('item').each(function () {
                        var tn_item = maxblog_functions.extract_data($(this));
                        tn_post_data.push(tn_item);
                    });
                } else {
                    check_page = false;
                }

                //load all data
                if (true == check_page && maxblog_functions.check_data(tn_post_data) != 1) {
                    maxblog_functions.get_data(tn_post_data, page + 1, page_name);
                } else {
                    //render block
                    maxblog_functions.render_breaking_news();
                    maxblog_functions.render_featured();
                    maxblog_functions.render_block_1();
                    maxblog_functions.render_block_2();
                    maxblog_functions.render_block_3();
                    maxblog_functions.render_block_4();

                    //thumb hover
                    maxblog_functions.share_hover();

                    //render widget
                    maxblog_functions.render_latest_widget(tn_post_data);
                    maxblog_functions.render_tag_cloud(tn_post_data);
                    maxblog_functions.render_facebook_widget();
                    maxblog_functions.render_instagram();

                    //smooth scrolling
                    if (typeof tn_site_smooth_scroll != 'undefined' && true == tn_site_smooth_scroll) {
                        tn_smooth_scroll();
                    }

                    //sticky navigation
                    if (typeof tn_enable_sticky_sidebar != 'undefined' && true == tn_enable_sticky_sidebar) {
                        tn_sticky_sidebar.sticky_sidebar($('.tn-sidebar-sticky'));
                    }

                    //to top button
                    if (typeof tn_enable_top_button != 'undefined' && true == tn_enable_top_button) {
                        $().UItoTop({
                            containerID: 'toTop',
                            easingType: 'easeOutQuart',
                            text: '<i class="fa fa-long-arrow-up"></i>',
                            scrollSpeed: 800
                        });
                    }

                    //open mobile navigation
                    maxblog_functions.open_mobile_nav();

                    //sticky navigation
                    if (typeof tn_enable_sticky_navigation != 'undefined' && true == tn_enable_sticky_navigation) {
                        var tn_nav_wrap = $('#navigation');
                        var tn_nav_sticky = tn_nav_wrap.find('.navigation-inner');
                        tn_nav_sticky.css('width', '100%');
                        tn_nav_wrap.css('min-height', tn_nav_sticky.height());
                        tn_nav_sticky.sticky({
                            className: 'is-sticky'
                        });
                    }

                    //search form
                    maxblog_functions.render_search();

                    //video responsive
                    $('.entry').fitVids();

                    //render comment
                    if (typeof tn_disqus_shortname != 'undefined') {
                        maxblog_functions.render_disqus(tn_disqus_shortname);
                    }

                }
            }
        });
    },


    //check & store data
    check_data: function (tn_post_data) {

        //var
        var check_breaking_news = false;
        var check_block_featured = false;
        var check_block_1 = false;
        var check_block_2 = false;
        var check_block_3 = false;
        var check_block_4 = false;

        var tn_featured_class = $('.featured-block-wrap');
        var tn_block_1_class = $('.tn-block-1-wrap');
        var tn_block_2_class = $('.tn-block-2-wrap');
        var tn_block_3_class = $('.tn-block-3-wrap');
        var tn_block_4_class = $('.tn-block-4-wrap');


        //check & add data for breaking new
        if (typeof tn_num_breaking_news !== 'undefined' && tn_num_breaking_news > 0) {
            var breaking_news_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                maxblog_functions.tn_breaking_new_data.push(post_el);
                breaking_news_counter++;
                if (breaking_news_counter >= tn_num_breaking_news) {
                    check_breaking_news = true;
                    return false;
                }
            })
        } else {
            //don't check
            check_breaking_news = true;
        }


        //check & add data for block featured
        if (tn_featured_class.length > 0 && typeof tn_block_featured_tag != 'undefined' && tn_block_featured_tag.length > 0 && typeof tn_num_block_featured != 'undefined' && tn_num_block_featured > 0) {
            var featured_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                var tags = $(post_el.tags);
                //check image & tags
                if (post_el.image_url) {
                    tags.each(function () {
                        if (tn_block_featured_tag == $(this).text()) {
                            featured_counter++;
                            maxblog_functions.tn_block_featured_data.push(post_el);
                            return true;
                        }
                    });
                }
                if (featured_counter == tn_num_block_featured) {
                    check_block_featured = true;
                    return false;
                }
            })
        } else {
            //don't check
            check_block_featured = true;
        }


        //check & add data for block 1
        if (tn_block_1_class.length > 0 && typeof tn_block_post_1_tag != 'undefined' && tn_block_post_1_tag.length > 0) {
            var block_post_1_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                var tags = $(post_el.tags);
                tags.each(function () {
                    if (tn_block_post_1_tag == $(this).text()) {
                        block_post_1_counter++;
                        maxblog_functions.tn_block_post_1_data.push(post_el);
                        return true;
                    }
                });

                if (block_post_1_counter >= 6) {
                    check_block_1 = true;
                    return false;
                }
            })
        } else {
            check_block_1 = true;
        }


        //check & add data for block 2
        if (tn_block_2_class.length > 0 && typeof tn_block_post_2_tag != 'undefined' && tn_block_post_2_tag.length > 0) {
            var block_post_2_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                var tags = $(post_el.tags);
                tags.each(function () {
                    if (tn_block_post_2_tag == $(this).text()) {
                        block_post_2_counter++;
                        maxblog_functions.tn_block_post_2_data.push(post_el);
                        return true;
                    }
                });

                if (block_post_2_counter >= 8) {
                    check_block_2 = true;
                    return false;
                }
            })
        } else {
            check_block_2 = true;
        }

        //check & add data for block 3
        if (tn_block_3_class.length > 0 && typeof tn_block_post_3_tag != 'undefined' && tn_block_post_3_tag.length > 0) {
            var block_post_3_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                var tags = $(post_el.tags);
                tags.each(function () {
                    if (tn_block_post_3_tag == $(this).text()) {
                        block_post_3_counter++;
                        maxblog_functions.tn_block_post_3_data.push(post_el);
                        return true;
                    }
                });
                if (block_post_3_counter >= 3) {
                    check_block_3 = true;
                    return false;
                }
            })
        } else {
            check_block_3 = true;
        }


        //check & add data for block 4
        if (tn_block_4_class.length > 0 && typeof tn_block_post_4_tag != 'undefined' && tn_block_post_4_tag.length > 0) {
            var block_post_4_counter = 0;
            $(tn_post_data).each(function () {
                var post_el = this;
                var tags = $(post_el.tags);
                tags.each(function () {
                    if (tn_block_post_4_tag == $(this).text()) {
                        block_post_4_counter++;
                        maxblog_functions.tn_block_post_4_data.push(post_el);
                        return true;
                    }
                });

                if (block_post_4_counter >= 8) {
                    check_block_4 = true;
                    return false;
                }
            })
        } else {
            check_block_4 = true;
        }

        //return check
        if (true == check_breaking_news && true == check_block_featured && true == check_block_1 && true == check_block_2 && true == check_block_3 && true == check_block_4) {
            return 1;
        } else {
            return 0;
        }
    },


    //render breaking new
    render_breaking_news: function () {
        var tn_breaking_new = $('#tn-ticker-bar');
        if (tn_breaking_new.length > 0) {
            $(maxblog_functions.tn_breaking_new_data).each(function () {
                var str = '';
                var post_el = this;
                str += '<li class="block-ticker-wrap">';
                str += '<h3 itemprop="name" class="post-title"><a itemprop="url" href="' + post_el['post_url'] + '" title"' + post_el['post_title'] + '">';
                str += post_el['post_title'];
                str += '</a></h3>';
                str += '</li>';

                //append to html
                tn_breaking_new.append(str);
            });

            //ticker bar
            tn_breaking_new.ticker({
                titleText: tn_breaking_new_title
            });
        }
    },

    render_featured: function () {
        var tn_block_featured = $('#featured-block');
        if (tn_block_featured.length > 0) {
            var post_counter = 0;
            var str = '';
            var str_slider = '';
            var str_small = '';
            var featured_post_data = $(maxblog_functions.tn_block_featured_data);
            var count_post = featured_post_data.size();
            var num_of_slider = count_post - 2;
            var prev_arrow = '<div class="tn-slider-prev tn-slider-nav"><i class="fa fa-angle-double-left"></i></div>';
            var next_arrow = '<div class="tn-slider-next tn-slider-nav"><i class="fa fa-angle-double-right"></i></div>';

            featured_post_data.each(function () {
                var post_el = this;
                if (post_counter < num_of_slider) {
                    str_slider += '<div class="featured-slider-el">';
                    str_slider += maxblog_functions.render_thumb(post_el, true, true, true);
                    str_slider += '<div class="module-content">';
                    str_slider += maxblog_functions.render_share_button();
                    str_slider += maxblog_functions.render_title(post_el);
                    str_slider += maxblog_functions.render_meta_bar(post_el);
                    str_slider += '</div>';
                    str_slider += '</div>'
                } else {
                    str_small += maxblog_functions.render_module_3(post_el);
                }
                post_counter++
            });

            str += '<div class="block-featured-slider col-sm-8 col-xs-12">';
            str += '<div class="slider-loading"></div>';
            str += '<div class="tn-featured-slider slider-init">';
            str += str_slider;
            str += '</div><!--#tn featured slider-->';
            str += '</div><!--#big slider -->';
            str += '<div class="block-featured-small col-sm-4 col-xs-12">';
            str += str_small;
            str += '</div><!--#small module -->';

            //append to slider
            tn_block_featured.append(str);

            var tn_featured_slider = $('.tn-featured-slider');
            if (tn_featured_slider.length > 0) {
                tn_featured_slider.on('init', function () {
                    var slider = $(this);
                    slider.prev('.slider-loading').fadeOut(600, function () {
                        $(this).remove();
                        slider.removeClass('slider-init');

                    });
                });
                tn_featured_slider.slick({
                    dots: false,
                    infinite: true,
                    autoplay: true,
                    speed: 400,
                    adaptiveHeight: true,
                    autoplaySpeed: 5000,
                    arrows: true,
                    prevArrow: prev_arrow,
                    nextArrow: next_arrow
                });
            }

        }
    },


    //render block 1
    render_block_1: function () {
        var tn_block_1 = $('.tn-block-1-wrap');
        if (tn_block_1.length > 0 && maxblog_functions.tn_block_post_1_data.length > 0) {
            var str = '';
            var str_big = '';
            var str_small = '';
            var block_1_post_data = $(maxblog_functions.tn_block_post_1_data);
            var block_counter = 0;

            block_1_post_data.each(function () {
                var post_el = this;
                if (0 == block_counter) {
                    str_big += maxblog_functions.render_module_1(post_el, 40);
                } else {
                    str_small += maxblog_functions.render_module_small(post_el);
                }
                block_counter++;
            });

            str += maxblog_functions.render_block_title(tn_block_post_1_tag);
            str += '<div class="block-content-wrap">';
            str += '<div class="col-sm-8 col-xs-12 is-half-col">';
            str += str_big;
            str += '</div><!--#left col-->';
            str += '<div class="col-sm-4 col-xs-12 is-half-col">';
            str += str_small;
            str += '</div><!--#right col -->';
            str += '</div><!--#block 1 content wrap -->';
            tn_block_1.append(str);
        }
    },

    //render block 2
    render_block_2: function () {
        var tn_block_2 = $('.tn-block-2-wrap');
        if (tn_block_2.length > 0 && maxblog_functions.tn_block_post_2_data.length > 0) {
            var str = '';
            var block_2_post_data = $(maxblog_functions.tn_block_post_2_data);
            var block_counter = 0;
            str += maxblog_functions.render_block_title(tn_block_post_2_tag);
            str += '<div class="block-content-wrap">';
            block_2_post_data.each(function () {
                var post_el = this;
                str += '<div class="col-sm-6 col-xs-12 is-half-col">';
                if (0 == block_counter || 1 == block_counter) {
                    str += maxblog_functions.render_module_1(post_el);
                } else {
                    str += maxblog_functions.render_module_small_thumb(post_el);
                }
                str += '</div>';

                block_counter++;
                if (block_counter % 2 == 0) {
                    str += '<div class="clearfix break-line"></div>'
                }
            });
            str += '</div><!--#block 2 content wrap -->';
            tn_block_2.append(str);
        }
    },


    //render block 3
    render_block_3: function () {
        var tn_block_3 = $('.tn-block-3-wrap');
        if (tn_block_3.length > 0 && maxblog_functions.tn_block_post_3_data.length > 0) {
            var str = '';
            var block_3_post_data = $(maxblog_functions.tn_block_post_3_data);
            str += maxblog_functions.render_block_title(tn_block_post_3_tag);
            str += '<div class="block-content-wrap">';
            block_3_post_data.each(function () {
                var post_el = this;
                str += '<div class="col-sm-4 col-xs-12 is-half-col">';
                str += maxblog_functions.render_module_2(post_el);
                str += '</div>';
            });
            str += '</div><!--#block 3 content wrap -->';
            tn_block_3.append(str);
        }
    },


    //render block 4
    render_block_4: function () {
        var tn_block_4 = $('.tn-block-4-wrap');
        if (tn_block_4.length > 0 && maxblog_functions.tn_block_post_4_data.length > 0) {
            var str = '';
            var block_4_post_data = $(maxblog_functions.tn_block_post_4_data);
            var block_counter = 0;
            str += maxblog_functions.render_block_title(tn_block_post_4_tag);
            str += '<div class="block-content-wrap">';
            block_4_post_data.each(function () {
                var post_el = this;
                str += '<div class="col-sm-6 col-xs-12 is-half-col">';
                if (0 == block_counter || 1 == block_counter) {
                    str += maxblog_functions.render_module_1(post_el);
                } else {
                    str += maxblog_functions.render_module_small_thumb(post_el);
                }
                str += '</div>';

                block_counter++;
                if (block_counter % 2 == 0) {
                    str += '<div class="clearfix break-line"></div>'
                }
            });

            str += '</div><!--#block 4 content wrap -->';
            tn_block_4.append(str);
        }
    },


    //extract post data
    extract_data: function (tn_post) {
        var data = [];
        data['post_url'] = tn_post.find('link').text();
        data['post_title'] = tn_post.find('title').text();
        data['tags'] = tn_post.find('category');
        data['image_url'] = tn_post.find('media\\:content, content').attr('url');
        data['post_content'] = tn_post.find('content\\:encoded, encoded').text();
        data['post_date'] = tn_post.find('pubDate').text();
        data['post_author'] = tn_post.find('dc\\:creator, creator').text();
        return data;
    },

    //render post title
    render_title: function (tn_post) {
        if (typeof  tn_post['post_url'] != 'undefined' && typeof  tn_post['post_title'] != 'undefined') {
            var str = '';
            str += '<h3 class="post-title" itemprop="name">';
            str += '<a itemprop="url" href="' + tn_post['post_url'] + '" title="' + tn_post['post_title'] + '">';
            str += tn_post['post_title'];
            str += '</a></h3>';
            return str;
        }
    },


    //render meta bar
    render_meta_bar: function (tn_post, remove_author) {
        var str = '';
        remove_author = remove_author || false;
        str += '<div class="meta-bar-wrap">';
        str += maxblog_functions.render_tags(tn_post);
        str += maxblog_functions.render_date(tn_post);
        if (true != remove_author) {
            str += maxblog_functions.render_author(tn_post);
        }
        str += '</div>';
        return str;
    },


    //render categories
    render_tags: function (tn_post) {
        if (typeof  tn_post['tags'] != 'undefined') {
            var str = '';
            str += '<span class="meta-el tag-meta">';
            var tags = tn_post['tags'];
            $(tags).each(function () {
                var tag = $(this).text();
                var tag_link = tag.toLowerCase().replace(/ /g, "-");
                str += '<a class="tag-el" href="/tag/' + tag_link + '">' + tag + '</a>';
            });
            str += '</span>';
            return str;
        }
    },


    //render date
    render_date: function (tn_post) {
        if (typeof tn_post['post_date'] != 'undefined') {
            var str = '';
            var date = maxblog_functions.get_date_format(tn_post['post_date']);
            var d = tn_post['post_date'];
            var d_array = d.split(' ');
            var timestamp = new Date(d_array[1] + "-" + d_array[2] + "-" + d_array[3]).getTime();
            str += '<span class="meta-el date-meta">';
            str += '<time itemprop="dateCreated" datetime="' + timestamp + '">' + date + '</time>';
            str += '</span>';
            return str;
        }
    },

    //get date format
    get_date_format: function (date) {
        var tn_date = new Date(date);
        var month_name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var tn_month = month_name[tn_date.getMonth()];
        return tn_month + ' ' + tn_date.getDate() + ',' + ' ' + tn_date.getFullYear();
    },


    //render author
    render_author: function (tn_post) {
        if (tn_post['post_author'] != 'undefined') {
            var str = '';
            str += '<span class="meta-el author-meta">';
            str += tn_post['post_author'];
            str += '</span>';
            return str;
        }
    },


    //render featured image
    render_thumb: function (tn_post, is_background, render_share, disable_share_button) {
        if (tn_post['image_url'] != 'undefined') {
            var str = '';
            str += '<div class="thumb-wrap">';
            str += '<a href="' + tn_post['post_url'] + '" title="' + tn_post['post_title'] + '">';
            if (true == is_background) {
                str += '<div class="thumb-image" style="background-image: url(' + tn_post['image_url'] + ')"></div>';
            } else {
                str += '<img src="' + tn_post['image_url'] + '" alt="' + tn_post['post_title'] + '">';
            }
            str += '</a>';

            //render share
            if (true == render_share) {
                if (true == disable_share_button) {
                    str += maxblog_functions.render_share(tn_post);
                } else {
                    str += maxblog_functions.render_share_button();
                    str += maxblog_functions.render_share(tn_post);
                }
            }
            str += '</div>';
            return str;
        }
    },


    //render excerpt
    render_excerpt: function (tn_post, num_word) {
        num_word = num_word || 20;
        if (tn_post['post_content'] != 'undefined') {
            var tn_content = $(tn_post['post_content']);
            tn_content = tn_content.text().replace("<code>", "&lt;code&gt;").replace("<", "&lt;").replace(">", "&gt;");
            tn_content = tn_content.split(/\s+/).slice(0, num_word).join(" ");
            var str = '';
            str += '<div class="entry">';
            str += tn_content;
            str += '</div>';
            return str;
        }
    },


    //render share post
    render_share: function (tn_post) {
        if (tn_post['post_url'] != 'undefined') {
            var str = '';
            str += '<div class="share-wrap share-invisible">';
            str += '<div class="share-inner">';
            str += '<a class="share-el" href="http://www.facebook.com/sharer.php?u=' + encodeURIComponent(tn_post['post_url']) + '" onclick="window.open(this.href, ' +
                '\'mywin\',\'left=50,top=50,width=600,height=350,toolbar=0\'); return false;"><i class="fa fa-facebook color-facebook"></i></a>';
            str += '<a class="share-to-social" href="https://twitter.com/intent/tweet?text=' + tn_post['post_title'] + '&amp;url=' + encodeURIComponent(tn_post['post_url']) + '" onclick="window.open(this.href, ' +
                '\'mywin\',\'left=50,top=50,width=600,height=350,toolbar=0\'); return false;"><i class="fa fa-twitter color-twitter"></i></a>';
            str += '<a class="share-to-social" href="http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(tn_post['post_url']) + '&amp;media=' + encodeURIComponent(tn_post['image_url']) + '" onclick="window.open(this.href, ' +
                '\'mywin\',\'left=50,top=50,width=600,height=350,toolbar=0\'); return false;"><i class="fa fa-pinterest color-pinterest"></i></a>';
            str += '</div>';
            str += '</div>';

            return str;
        }
    },


    //render share button
    render_share_button: function () {
        return '<div class="share-button-wrap"><i class="fa fa-share"></i><span>share</span></div>';
    },


    //render block title
    render_block_title: function (tags) {
        if (tags != 'undefined') {
            var str = '';
            str += '<div class="block-title-wrap">';
            str += '<h3 class="block-title">' + tags + '</h3>';
            str += '</div>';
            return str;
        }
    },


    //render module 1
    render_module_1: function (tn_post, excerpt) {
        var str = '';
        excerpt = excerpt || 20;
        str += '<div class="module-1-wrap">';
        str += maxblog_functions.render_thumb(tn_post, true, true);
        str += '<div class="module-content">';
        str += maxblog_functions.render_title(tn_post);
        str += maxblog_functions.render_meta_bar(tn_post);
        str += maxblog_functions.render_excerpt(tn_post, excerpt);
        str += '</div>';
        str += '</div><!--#module 1-->';
        return str;
    },

    //render module 2
    render_module_2: function (tn_post) {
        var str = '';
        str += '<div class="module-2-wrap">';
        str += maxblog_functions.render_thumb(tn_post, true, true);
        str += '<div class="module-content">';
        str += maxblog_functions.render_meta_bar(tn_post, true);
        str += maxblog_functions.render_title(tn_post);
        str += '</div>';
        str += '</div><!--#module 3 wrap-->';
        return str;
    },

    //render module 3
    render_module_3: function (tn_post) {
        var str = '';
        str += '<div class="module-3-wrap">';
        str += maxblog_functions.render_thumb(tn_post, true, true, true);
        str += '<div class="module-content">';
        str += maxblog_functions.render_share_button();
        str += maxblog_functions.render_title(tn_post);
        str += maxblog_functions.render_meta_bar(tn_post);
        str += '</div>';
        str += '</div><!--#module 3 wrap-->';
        return str;
    },


    //render module small
    render_module_small: function (tn_post) {
        var str = '';
        str += '<div class="module-small-wrap">';
        str += maxblog_functions.render_title(tn_post);
        str += maxblog_functions.render_meta_bar(tn_post, true);
        str += '</div><!--#module small-->';
        return str;
    },


    //render module small has thumb
    render_module_small_thumb: function (tn_post) {
        var str = '';
        str += '<div class="module-small-wrap is-small-thumb">';
        str += maxblog_functions.render_thumb(tn_post, true);
        str += maxblog_functions.render_title(tn_post);
        str += maxblog_functions.render_meta_bar(tn_post, true);
        str += '</div><!--#module small-->';
        return str;
    },

    //share hover
    share_hover: function () {
        var share_button = $('.share-button-wrap');
        share_button.hover(function () {
            var thumb_wrap = $(this).closest('.thumb-wrap');
            var share_social = thumb_wrap.find('.share-wrap');
            if (share_social.length > 0) {
                share_social.addClass('share-visible');
                thumb_wrap.mouseleave(function () {
                    share_social.removeClass('share-visible');
                });
            } else {
                thumb_wrap = $(this).closest('.module-content').prev();
                share_social = thumb_wrap.find('.share-wrap');
                if (share_social.length > 0) {
                    share_social.addClass('share-visible');
                    thumb_wrap.mouseleave(function () {
                        share_social.removeClass('share-visible');
                    });
                }
            }
            return false;
        });
    },


    //render latest widget
    render_latest_widget: function (tn_post_data) {
        var tn_latest = $('.tn-latest-wrap');
        if (tn_latest.length > 0) {
            var str = '';
            $(tn_post_data).slice(0, 4).each(function () {
                var tn_post = this;
                str += maxblog_functions.render_module_small_thumb(tn_post)
            });
            tn_latest.append(str);
        }
    },


    //render tag cloud
    render_tag_cloud: function (tn_post_data) {
        var tn_tag_cloud = $('.tn-tag-cloud');
        if (tn_tag_cloud.length > 0) {
            var tags_data = [];
            var str = '';
            $(tn_post_data).each(function () {
                var tags = $(this['tags']);
                tags.each(function () {
                    var tag = $(this).text();
                    if (-1 == $.inArray(tag, tags_data)) {
                        tags_data.push(tag);
                    }
                })
            });
            $(tags_data).each(function () {
                var tag_name = this;
                var tag_link = tag_name.toLowerCase().replace(/ /g, '-');
                str += '<a class="tag-cloud-el" href="/tag/' + tag_link + '">' + tag_name + '</a>';
            });
            tn_tag_cloud.append(str);
        }
    },


    //render facebook widget
    render_facebook_widget: function () {
        var tn_facebook = $('.tn-faecbook-widget');
        if (tn_facebook.length > 0 && typeof tn_fanpage_url != 'undefined') {
            var facebook_sdk_script = '<div id="fb-root"></div><script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4";fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'facebook-jssdk\'));</script>';
            var str = '<div class="fb-page" data-href="' + tn_fanpage_url + '" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true" data-show-posts="false"><div class="fb-xfbml-parse-ignore"></div></div>';
            $('body').append(facebook_sdk_script);
            tn_facebook.append(str);
        }
    },


    //render instagram widget
    render_instagram: function () {
        var tn_instagram = $('.tn-instagram');
        if (tn_instagram.length > 0 && typeof tn_instagram_id != 'undefined' && typeof tn_instagram_client_id != 'undefined') {
            var str = '';
            $.ajax({
                type: 'GET',
                cache: true,
                url: 'https://api.instagram.com/v1/users/' + tn_instagram_id + '/media/recent/?client_id=' + tn_instagram_client_id,
                dataType: 'jsonp'
            }).done(function (data_response) {
                var tn_photos = data_response.data.slice(0, 9);
                $(tn_photos).each(function () {
                    str += '<a href="' + this.link + '" target="_blank" class="col-xs-4 instagram-el"><img src="' + this.images.low_resolution.url + '" alt=""></a>';
                });
                tn_instagram.append(str);
            }).fail(function () {
                console.log('Instagram not responding');
            });
        }
    },

    //render search
    render_search: function () {
        var tn_search_button = $('#search-icon');
        var tn_search_form = $('#search-form');
        var tn_search_input = $('#search-form-text');

        tn_search_button.click(function () {
            tn_search_form.toggleClass('is-display');
            return false;
        });
        tn_search_input.ghostHunter({
            results: "#ajax-search-result",
            zeroResultsInfo: false,
            onKeyUp: true,
            info_template: '<div class="result-info">Number of posts found: {{amount}}</div>',
            result_template: '<div class="search-result-el post-title"><a href="{{link}}"></i>{{title}}</a></div>'
        });
    },


    //open mobile navigation
    open_mobile_nav: function () {

        //menu responsive
        $('#mobile-button-nav-open').click(function () {
            $('body').toggleClass('mobile-js-menu');
            return false;
        });

        var mobile_menu = $('#main-mobile-menu');
        var mobile_button = $('#close-mobile-menu-button');

        $('html').click(function () {
            $('body').removeClass('mobile-js-menu');
        });

        mobile_menu.click(function (event) {
            event.stopPropagation();
        });

        mobile_button.click(function () {
            $('body').removeClass('mobile-js-menu');
            return false;
        });

        $(window).resize(function () {
            //remove menu mobile
            if ($(this).width() > 991) {
                $('body').removeClass('mobile-js-menu');
            }
        })
    },


    //render disqus comment
    render_disqus: function (shortname) {
        var tn_disqus = $('#tn-disqus-comment');
        if (tn_disqus.length > 0) {
            tn_disqus.html('<div id="disqus_thread"></div>');
            var disqus_shortname = shortname;
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        }
    },

    init: function () {
        maxblog_functions.get_data();
    }
};


/*--------------------------------------------------------------
 2. INIT
 --------------------------------------------------------------*/
jQuery(document).ready(function () {
    maxblog_functions.init();
});