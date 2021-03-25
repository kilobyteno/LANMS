<template>
  <div class="row justify-content-center my-5">
    <div class="col-md-12">
      <div class="card shadow bg-light">
        <div class="card-body bg-white px-5 py-3 border-bottom rounded-top">
          <div class="mx-3 my-3">
            <div>
              <jet-application-logo style="width: 317px;" />
            </div>

            <h3 class="h3 my-4">
              Welcome to your LANMS application!
            </h3>

            <div class="text-muted">
              You reached the dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JetApplicationLogo from '@/Jetstream/ApplicationLogo'

export default {
  components: {
    JetApplicationLogo,
  },
}
</script>
