<template>
  <div>
    <div class="container-fluid fixed-top p-4">
      <div class="col-12">
        <div v-if="canLogin" class="d-flex justify-content-end">
          <div>
            <inertia-link v-if="$page.props.user" href="/dashboard" class="text-muted">
              Dashboard
            </inertia-link>

            <template v-else>
              <inertia-link :href="route('login')" class="text-muted">
                Log in
              </inertia-link>

              <inertia-link v-if="canRegister" :href="route('register')" class="ml-4 text-muted">
                Register
              </inertia-link>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid my-5 pt-5 px-5">
      <div class="row justify-content-center px-4">
        <div class="col-6 text-center">
          <jet-application-logo class="mx-auto w-50" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

<script>
import JetApplicationLogo from '@/Jetstream/ApplicationLogo'
export default {
  components: {
    JetApplicationLogo,
  },
  props: {
    canLogin: Boolean,
    canRegister: Boolean,
  }
}
</script>
