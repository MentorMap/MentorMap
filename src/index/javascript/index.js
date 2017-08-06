$('.carousel').slick({
	slidesToShow: 4,
	slidesToScroll: 1,
	autoplay: true,
	autoplaySpeed: 1500,
	dots: true,
	infinite: true,
	arrows: false,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3,
				infinite: true,
				dots: true,
			},
		},
		{
			breakpoint: 600,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			},
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			},
		},
	],

})

$('.testimonials-carousel').slick({
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
	autoplaySpeed: 4000,
	dots: true,
	infinite: true,
	arrows: false,
})

$(() => {
	$('img.scale').imageScale({
		scale: 'best-fit-down',
		align: 'left',
	})
})

$(() => {
	$('#logos div').matchHeight(false)
})



$(document).ready(() => {

	var myVideo = document.getElementById('video1')

	function playPause () {
		if (myVideo.paused)
			myVideo.play()
		else
			myVideo.pause()
	}

	function makeBig () {
		myVideo.width = 560
	}

	function makeSmall () {
		myVideo.width = 320
	}

	function makeNormal () {
		myVideo.width = 420
	}

	// Mouse click scroll
	$(document).ready(() => {
		$('.mouse').click(() => {
			$('html, body').animate({ scrollTop: '+=750px' }, 1200)
		})
	})

	// Features appearance
	$(window).scroll(() => {
		var scroll = $(window).scrollTop()

		// >=, not <=
		if (scroll >= 500) {
			$('.feature-icon').addClass('feature-display')
			$('.feature-head-text').addClass('feature-display')
			$('.feature-subtext').addClass('feature-display')
		}
	})

	// Subscribe to newsletter
	$('#email-form').on('submit', e => {
		e.preventDefault()


		$('#newsletter-spinner').css('display', 'inline-block')

		var data = { email: $('#newsletter-email-input').val() }

		$.ajax({
			url: '/mailchimp.php',
			type: 'POST',
			data,
			success (data) {

				console.log(data)
				$('#newsletter-spinner').css('display', 'none')
				$('#newsletter-loading-div').html('Success! Cool things are on their way')
				$('#newsletter-email-input').val('')

				window.location.href = '/nova.zip'
			},
			error (error) {
				console.log(error)
				$('#newsletter-spinner').fadeOut()
			},
		})
	})


	// smooth scrolling

	$('a[href*="#"]:not([href="#"])').click(function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash)
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
			if (target.length) {
				$('html, body').animate({ scrollTop: target.offset().top }, 1000)
				return false
			}
		}
	})


})
