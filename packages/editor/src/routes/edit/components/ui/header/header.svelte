<header class="hover:opacity-100">
	<h1>My Cool Program</h1>
</header>

<style lang="postcss">
	header {
		background-color: theme('colors.secondary.DEFAULT');
		@apply rounded-md border border-solid border-gray-600;
		@apply m-2.5 p-3.5;
		@apply opacity-60 transition-opacity duration-300;
	}
	h1 {
		@apply cursor-default;
		@apply text-foreground text-sm font-semibold;
	}
</style>
